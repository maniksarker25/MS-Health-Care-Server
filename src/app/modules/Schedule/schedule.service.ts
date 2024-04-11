import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../utils/prisma";
import { Schedule } from "@prisma/client";
import { TSchedule } from "./schedule.interface";
const createScheduleIntoDB = async (
  payload: TSchedule
): Promise<Schedule[]> => {
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
      const scheduleData = {
        startDateTime: startDateTime,
        endDateTime: addMinutes(startDateTime, intervalTime),
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

export const scheduleService = {
  createScheduleIntoDB,
};
