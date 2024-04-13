import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { appointmentService } from "./appointment.service";
import pick from "../../utils/pick";

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
const getMyAllAppointment = catchAsync(async (req, res) => {
  const user = req.user;
  const filters = pick(req.query, ["status", "paymentStatus"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await appointmentService.getMyAllAppointmentFromDB(
    user,
    filters,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment retrieved successfully",
    data: result,
  });
});

export const appointmentController = {
  createAppointment,
  getMyAllAppointment,
};
