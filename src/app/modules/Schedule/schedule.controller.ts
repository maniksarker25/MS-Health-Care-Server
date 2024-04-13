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
  const user = req.user;
  const result = await scheduleService.getAllScheduleFromDB(
    filters,
    options,
    user
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

// get single schedule
const getSingleSchedule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await scheduleService.getSingleScheduleFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

// delete single schedule
const deleteSingleSchedule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await scheduleService.deleteSingleScheduleFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const scheduleController = {
  createSchedule,
  getAllSchedule,
  getSingleSchedule,
  deleteSingleSchedule,
};
