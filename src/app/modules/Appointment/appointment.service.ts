import { JwtPayload } from "jsonwebtoken";
import prisma from "../../utils/prisma";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
import { TPaginationOptions } from "../../interface/pagination";
import { calculatePagination } from "../../helpers/paginationHelper";
import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
const { v4: uuidv4 } = require("uuid");

const createAppointmentIntoDB = async (user: JwtPayload, payload: any) => {
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload?.doctorId,
    },
  });

  // check doctor schedule exits and isBooked false
  const doctorScheduleData = await prisma.doctorSchedules.findFirst({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tx) => {
    const createdAppointData = await tx.appointment.create({
      data: {
        patientId: patientInfo.id,
        doctorId: doctorInfo.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });
    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorInfo.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: createdAppointData.id,
      },
    });

    // make transaction id for payment
    const today = new Date();
    // const transactionId =
    //   "ms-healthcare" +
    //   "-" +
    //   today.getFullYear() +
    //   "-" +
    //   today.getMonth() +
    //   "-" +
    //   today.getDay() +
    //   "-" +
    //   today.getHours() +
    //   "-" +
    //   today.getMinutes() +
    //   "-" +
    //   today.getMilliseconds();
    const transactionId = `mshcare-${uuidv4()}`;

    await tx.payment.create({
      data: {
        appointmentId: createdAppointData.id,
        amount: doctorInfo.appointmentFee,
        transactionId,
      },
    });

    return createdAppointData;
  });

  return result;
};

// get my all appointments from db
const getMyAllAppointmentFromDB = async (
  user: JwtPayload,
  filters: any,
  options: TPaginationOptions
) => {
  const { ...filterData } = filters;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (user.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user.email,
      },
    });
  }
  if (user.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user.email,
      },
    });
  }

  if (Object.keys(filterData)?.length > 0) {
    andConditions.push({
      AND: Object.keys(filterData)?.map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.AppointmentWhereInput = { AND: andConditions };
  // console.dir(whereConditions, { depth: "infinity" });
  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options?.sortOrder
        ? {
            [options?.sortBy]: options?.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    include:
      user.role === UserRole.PATIENT
        ? { schedule: true, doctor: true }
        : {
            schedule: true,
            patient: {
              include: {
                medicalReport: true,
                patientHealthData: true,
              },
            },
          },
  });
  const total = await prisma.appointment.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// update appointment status into db
const updateAppointmentStatusIntoDB = async (
  user: JwtPayload,
  appointmentId: string,
  appointmentStatus: AppointmentStatus
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });
  // console.log(appointmentData);

  if (user?.role === UserRole.DOCTOR) {
    if (!(user?.email === appointmentData.doctor.email)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment"
      );
    }
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      appointmentStatus,
    },
  });

  return result;
};

//
const cancelUnpaidAppointmentsFromDB = async () => {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });
  // take unpaid appointments ids
  const unPaidAppointmentIds = unPaidAppointments.map(
    (appointment) => appointment.id
  );

  await prisma.$transaction(async (tx) => {
    // delete payment data
    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: unPaidAppointmentIds,
        },
      },
    });
    // delete appointment
    await tx.appointment.deleteMany({
      where: {
        id: {
          in: unPaidAppointmentIds,
        },
      },
    });
    // update doctor schedule
    for (const unPaidAppointment of unPaidAppointments) {
      await tx.doctorSchedules.updateMany({
        where: {
          doctorId: unPaidAppointment.doctorId,
          scheduleId: unPaidAppointment.scheduleId,
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
  // console.log("updated");
};
export const appointmentService = {
  createAppointmentIntoDB,
  getMyAllAppointmentFromDB,
  updateAppointmentStatusIntoDB,
  cancelUnpaidAppointmentsFromDB,
};
