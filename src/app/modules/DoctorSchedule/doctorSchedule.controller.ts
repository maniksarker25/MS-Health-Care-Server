import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";

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

export const doctorScheduleController = {
  createDoctorSchedule,
};
