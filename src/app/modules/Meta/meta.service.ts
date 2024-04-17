import { PaymentStatus, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
import prisma from "../../utils/prisma";

const fetchDashboardMetaDataFromDB = async (user: JwtPayload) => {
  let metaData;
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      metaData = getSuperAdminMetaData();
      break;
    case UserRole.ADMIN:
      metaData = getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metaData = getDoctorMetaData(user);
      break;
    case UserRole.PATIENT:
      metaData = getPatientMetaData(user);
      break;
    default:
      throw new AppError(httpStatus.BAD_REQUEST, "Invliad user role");
  }

  return metaData;
};

const getSuperAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const adminCount = await prisma.admin.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const barChartData = await getBarChartData();
  return {
    appointmentCount,
    patientCount,
    doctorCount,
    adminCount,
    paymentCount,
    totalRevenue,
    barChartData,
  };
};
const getAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  return {
    appointmentCount,
    patientCount,
    doctorCount,
    paymentCount,
    totalRevenue,
  };
};
const getDoctorMetaData = async (user: JwtPayload) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });
  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: {
      patientId: true,
    },
    where: {
      doctorId: doctorData.id,
    },
  });
  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
      status: PaymentStatus.PAID,
    },
  });
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["appointmentStatus"],
    _count: {
      id: true,
    },
    where: {
      doctorId: doctorData.id,
    },
  });
  const formattedAppointStatusDistribution = appointmentStatusDistribution.map(
    (count) => ({
      appointmentStatus: count.appointmentStatus,
      count: Number(count._count.id),
    })
  );
  return {
    appointmentCount,
    patientCount: patientCount.length,
    reviewCount,
    totalRevenue,
    formattedAppointStatusDistribution,
  };
};
const getPatientMetaData = async (user: JwtPayload) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData.id,
    },
  });
  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });
  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData.id,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["appointmentStatus"],
    _count: {
      id: true,
    },
    where: {
      patientId: patientData.id,
    },
  });
  const formattedAppointStatusDistribution = appointmentStatusDistribution.map(
    (count) => ({
      appointmentStatus: count.appointmentStatus,
      count: Number(count._count.id),
    })
  );
  return {
    appointmentCount,
    prescriptionCount,
    reviewCount,
    formattedAppointStatusDistribution,
  };
};

// get bar chart data
const getBarChartData = async () => {
  const appointmentCountByMonth: { month: Date; count: bigint }[] =
    await prisma.$queryRaw`
  SELECT DATE_TRUNC('month',"createdAt") AS month,
  CAST(COUNT(*) AS INTEGER) AS count
  FROM "appointments"
  GROUP BY month
  ORDER BY month ASC
  
`;
  return appointmentCountByMonth;
};

export const metaService = {
  fetchDashboardMetaDataFromDB,
};
