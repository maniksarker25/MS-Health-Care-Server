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

  const result = await prisma.$transaction(async (tx) => {
    const result = await tx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });
    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return result;
  });

  return result;
};

export const reviewService = {
  createReviewIntoDB,
};
