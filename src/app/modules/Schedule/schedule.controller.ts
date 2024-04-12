import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { scheduleService } from "./schedule.service";
import pick from "../../utils/pick";

const createSchedule = catchAsync(async (req, res) => {
  const result = await scheduleService.createScheduleIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});
const getAllSchedule = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["startDate", "endDate"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await scheduleService.getAllScheduleFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

export const scheduleController = {
  createSchedule,
  getAllSchedule,
};
