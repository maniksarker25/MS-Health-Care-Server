import { JwtPayload } from "jsonwebtoken";
import prisma from "../../utils/prisma";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
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
    const transactionId =
      "ms-healthcare" +
      "-" +
      today.getFullYear() +
      "-" +
      today.getMonth() +
      "-" +
      today.getDay() +
      "-" +
      today.getHours() +
      "-" +
      today.getMinutes() +
      "-" +
      today.getMilliseconds();

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

export const appointmentService = {
  createAppointmentIntoDB,
};
