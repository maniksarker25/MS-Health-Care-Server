import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";
import pick from "../../utils/pick";

const createDoctorSchedule = catchAsync(async (req, res) => {
  const user = req.user;
  console.log(user);
  const result = await doctorScheduleService.createDoctorScheduleIntoDB(
    user,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Doctor schedule created successfully",
    data: result,
  });
});

const getMySchedule = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const user = req.user;
  const result = await doctorScheduleService.getMyScheduleFromDB(
    filters,
    options,
    user
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "My Schedule retrieved successfully",
    data: result,
  });
});

const deleteDoctorSchedule = catchAsync(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const result = await doctorScheduleService.deleteDoctorScheduleFromDB(
    user,
    id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " Schedule deleted successfully",
    data: result,
  });
});

export const doctorScheduleController = {
  createDoctorSchedule,
  getMySchedule,
  deleteDoctorSchedule,
};
