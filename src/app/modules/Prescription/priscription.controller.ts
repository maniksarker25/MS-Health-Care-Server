import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { prescriptionService } from "./priscription.service";

const createPrescription = catchAsync(async (req, res) => {
  const result = await prescriptionService.createPrescriptionIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Prescription created successful",
    data: result,
  });
});

export const prescriptionController = {
  createPrescription,
};
