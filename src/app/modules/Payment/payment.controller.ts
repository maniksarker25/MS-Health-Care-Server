import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const initPayment = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await paymentService.initPaymentIntoDB();
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment initialization successful",
    data: result,
  });
});

export const paymentController = {
  initPayment,
};