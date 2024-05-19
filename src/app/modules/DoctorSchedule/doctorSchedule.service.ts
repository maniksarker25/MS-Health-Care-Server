import { JwtPayload } from "jsonwebtoken";
import prisma from "../../utils/prisma";
import { TPaginationOptions } from "../../interface/pagination";
import { calculatePagination } from "../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";
import AppError from "../../errors/appError";
import httpStatus from "http-status";

const createDoctorScheduleIntoDB = async (
  user: JwtPayload,
  payload: {
    scheduleIds: string[];
  }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData?.id,
    scheduleId,
  }));
  //   console.log(doctorScheduleData);
  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
  return result;
};

// get my all schedule
const getMyScheduleFromDB = async (
  query: any,
  options: TPaginationOptions,
  user: JwtPayload
) => {
  const { startDate, endDate, ...filterData } = query;

  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  // console.log(filterData);

  const andConditions: Prisma.DoctorSchedulesWhereInput[] = [];

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          schedule: {
            startDateTime: {
              gte: startDate,
            },
          },
        },
        {
          schedule: {
            endDateTime: {
              lte: endDate,
            },
          },
        },
      ],
    });
  }

  // make queries for filter data
  if (Object.keys(filterData)?.length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }
    andConditions.push({
      AND: Object.keys(filterData)?.map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.DoctorSchedulesWhereInput = {
    AND: andConditions,
  };

  // console.log(doctorScheduleIds);

  const result = await prisma.doctorSchedules.findMany({
    where: {
      ...whereConditions,
      doctor: {
        email: user?.email,
      },
    },
    include: {
      doctor: true,
      schedule: true,
      appointment: true,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options?.sortOrder
        ? {
            [options?.sortBy]: options?.sortOrder,
          }
        : {
            // createdAt: "desc",
          },
  });
  const total = await prisma.doctorSchedules.count({
    where: {
      ...whereConditions,
      doctor: {
        email: user?.email,
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

// get all schedules for
const getAllDoctorScheduleFromDB = async (
  query: any,
  options: TPaginationOptions
) => {
  const { startDate, endDate, ...filterData } = query;

  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  // console.log(filterData);

  const andConditions: Prisma.DoctorSchedulesWhereInput[] = [];

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          schedule: {
            startDateTime: {
              gte: startDate,
            },
          },
        },
        {
          schedule: {
            endDateTime: {
              lte: endDate,
            },
          },
        },
      ],
    });
  }

  // make queries for filter data
  if (Object.keys(filterData)?.length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }
    andConditions.push({
      AND: Object.keys(filterData)?.map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.DoctorSchedulesWhereInput = {
    AND: andConditions,
  };

  // console.log(doctorScheduleIds);

  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    include: {
      doctor: true,
      schedule: true,
      appointment: true,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options?.sortOrder
        ? {
            [options?.sortBy]: options?.sortOrder,
          }
        : {
            // createdAt: "desc",
          },
  });
  const total = await prisma.doctorSchedules.count({
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

// delete schedule from db
const deleteDoctorScheduleFromDB = async (
  user: JwtPayload,
  scheduleId: string
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const isBookedSchedule = await prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleId,
      },
      isBooked: true,
    },
  });
  if (isBookedSchedule) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can not deleted this schedule.Because this schedule is already booked"
    );
  }
  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleId,
      },
    },
  });

  return result;
};

export const doctorScheduleService = {
  createDoctorScheduleIntoDB,
  getMyScheduleFromDB,
  deleteDoctorScheduleFromDB,
  getAllDoctorScheduleFromDB,
};
