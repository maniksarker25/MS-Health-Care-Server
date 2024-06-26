import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../utils/prisma";
import { Prisma, Schedule } from "@prisma/client";
import { TSchedule, TScheduleFilterRequest } from "./schedule.interface";
import { calculatePagination } from "../../helpers/paginationHelper";
import { TPaginationOptions } from "../../interface/pagination";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/appError";
import httpStatus from "http-status";

const convertDateTimeToUTC = async (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  // console.log(offset);
  // console.log("converted date", new Date(date.getTime() + offset));
  return new Date(date.getTime() + offset);
};
const createScheduleIntoDB = async (
  payload: TSchedule
): Promise<Schedule[]> => {
  console.log("nice schedule");
  const { startDate, endDate, startTime, endTime } = payload;

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const intervalTime = 30;
  const schedules = [];

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );
    // console.log("startTime", startDateTime);
    // console.log("endtime", endDateTime);

    while (startDateTime < endDateTime) {
      // const scheduleData = {
      //   startDateTime: startDateTime,
      //   endDateTime: addMinutes(startDateTime, intervalTime),
      // };
      // for utc time zone
      const s = await convertDateTimeToUTC(startDateTime);
      const e = await convertDateTimeToUTC(
        addMinutes(startDateTime, intervalTime)
      );
      const scheduleData = {
        startDateTime: s,
        endDateTime: e,
      };
      // console.log(scheduleData);

      // check the schedule existing or not
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData?.startDateTime,
          endDateTime: scheduleData?.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        // push to the schedules variable
        schedules.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const getAllScheduleFromDB = async (
  query: TScheduleFilterRequest,
  options: TPaginationOptions,
  user: JwtPayload
) => {
  const { startDate, endDate, ...filterData } = query;

  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  // console.log(filterData);

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: startDate,
          },
        },
        {
          endDateTime: {
            lte: endDate,
          },
        },
      ],
    });
  }

  // make queries for filter data
  if (Object.keys(filterData)?.length > 0) {
    andConditions.push({
      AND: Object.keys(filterData)?.map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  // const whereConditions: Prisma.ScheduleWhereInput = { AND: andConditions };
  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  // console.dir(whereConditions, { depth: "infinity" });

  // find all schedules for this doctor for not show duplicate schedules
  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user?.email,
      },
    },
  });

  // get all ids for schedule
  const doctorScheduleIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );
  // console.log(doctorScheduleIds);

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: { notIn: doctorScheduleIds },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options?.sortOrder
        ? {
            [options?.sortBy]: options?.sortOrder,
          }
        : {
            createdAt: "asc",
          },
  });
  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: { notIn: doctorScheduleIds },
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

// get single schedule
const getSingleScheduleFromDB = async (id: string) => {
  const result = await prisma.schedule.findUniqueOrThrow({
    where: {
      id,
    },
  });
  return result;
};

// delete single schedule
const deleteSingleScheduleFromDB = async (id: string) => {
  const schedule = await prisma.schedule.findUnique({
    where: {
      id,
    },
  });
  if (!schedule) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });

  return result;
};

export const scheduleService = {
  createScheduleIntoDB,
  getAllScheduleFromDB,
  getSingleScheduleFromDB,
  deleteSingleScheduleFromDB,
};
