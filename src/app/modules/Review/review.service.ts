import { JwtPayload } from "jsonwebtoken";
import prisma from "../../utils/prisma";
import AppError from "../../errors/appError";
import httpStatus from "http-status";

const createReviewIntoDB = async (user: JwtPayload, payload: any) => {
  //get patient data
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  // get appointment data
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });
  if (!(patientData.id === appointmentData.patientId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }
  const result = await prisma.review.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return result;
};

export const reviewService = {
  createReviewIntoDB,
};
