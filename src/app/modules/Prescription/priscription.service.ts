import { JwtPayload } from "jsonwebtoken";
import prisma from "../../utils/prisma";
import { AppointmentStatus, PaymentStatus, Prescription } from "@prisma/client";
import AppError from "../../errors/appError";
import httpStatus from "http-status";

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

export const prescriptionService = {
  createPrescriptionIntoDB,
};
