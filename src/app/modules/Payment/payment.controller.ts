import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const initPayment = catchAsync(async (req, res) => {
  const user = req.user;
  const { appointmentId } = req.params;
  const result = await paymentService.initPaymentIntoDB(appointmentId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment initialization successful",
    data: result,
  });
});
const validatePayment = catchAsync(async (req, res) => {
  const result = await paymentService.validatePayment(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment validation successful",
    data: result,
  });
});

export const paymentController = {
  initPayment,
  validatePayment,
};
