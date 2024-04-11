import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { scheduleService } from "./schedule.service";

const createSchedule = catchAsync(async (req, res) => {
  const result = await scheduleService.createScheduleIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Specialties created successfully",
    data: result,
  });
});

export const specialtiesController = {
  createSchedule,
};
