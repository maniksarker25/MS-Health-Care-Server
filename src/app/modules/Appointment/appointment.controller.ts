import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { appointmentService } from "./appointment.service";

const createAppointment = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await appointmentService.createAppointmentIntoDB(
    user,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Appointment created successfully",
    data: result,
  });
});

export const appointmentController = {
  createAppointment,
};
