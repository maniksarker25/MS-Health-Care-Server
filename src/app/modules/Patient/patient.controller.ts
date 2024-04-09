import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import pick from "../../utils/pick";
import sendResponse from "../../utils/sendResponse";
import prisma from "../../utils/prisma";
import { patientFilterableFields } from "./patient.constant";
import { patientService } from "./patient.service";

const getAllPatient = catchAsync(async (req, res) => {
  const filters = pick(req?.query, patientFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  // console.log("options", options);
  const result = await patientService.getAllPatientFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieved successfully",
    meta: result?.meta,
    data: result?.data,
  });
});

// get single Patient
const getSinglePatient = catchAsync(async (req, res) => {
  const result = await patientService.getSinglePatientFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieved successfully",
    data: result,
  });
});

// delete patient
const deletePatient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await patientService.deletePatientFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});
// soft delete
const softDeletePatient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await patientService.softDeletePatientFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

export const patientController = {
  getAllPatient,
  getSinglePatient,
  deletePatient,
  softDeletePatient,
};
