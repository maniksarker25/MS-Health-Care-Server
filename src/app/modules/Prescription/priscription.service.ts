import { JwtPayload } from "jsonwebtoken";
import prisma from "../../utils/prisma";
import { AppointmentStatus, PaymentStatus, Prescription } from "@prisma/client";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
import { TPaginationOptions } from "../../interface/pagination";
import { calculatePagination } from "../../helpers/paginationHelper";

const createPrescriptionIntoDB = async (
  user: JwtPayload,
  payload: Prescription
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      appointmentStatus: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });
  if (!(user?.email === appointmentData.doctor.email)) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }
  const result = await prisma.prescription.create({
    data: {
      ...payload,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

// get my all prescription information from db
const getMyAllPrescriptionFromDB = async (
  user: JwtPayload,
  options: TPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user.email,
      },
    },
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
    include: {
      doctor: true,
    },
  });

  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user.email,
      },
    },
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

export const prescriptionService = {
  createPrescriptionIntoDB,
  getMyAllPrescriptionFromDB,
};
