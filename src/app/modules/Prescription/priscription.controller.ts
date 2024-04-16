import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { prescriptionService } from "./priscription.service";
import pick from "../../utils/pick";

const createPrescription = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await prescriptionService.createPrescriptionIntoDB(
    user,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Prescription created successful",
    data: result,
  });
});

//
const getMyAllPrescription = catchAsync(async (req, res) => {
  const user = req.user;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await prescriptionService.getMyAllPrescriptionFromDB(
    user,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription retrieved successful",
    data: result,
  });
});
export const prescriptionController = {
  createPrescription,
  getMyAllPrescription,
};
