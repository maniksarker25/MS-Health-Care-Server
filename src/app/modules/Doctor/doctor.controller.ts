import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import pick from "../../utils/pick";
import sendResponse from "../../utils/sendResponse";
import { doctorFilterableFields } from "./doctor.constant";
import { doctorService } from "./doctor.service";
import { Doctor } from "@prisma/client";
import prisma from "../../utils/prisma";

const getAllDoctor = catchAsync(async (req, res) => {
  const filters = pick(req?.query, doctorFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  // console.log("options", options);
  const result = await doctorService.getAllDoctorFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor retrieved successfully",
    meta: result?.meta,
    data: result?.data,
  });
});

// get single admin
const getSingleDoctor = catchAsync(async (req, res) => {
  const result = await doctorService.getSingleDoctorFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor retrieved successfully",
    data: result,
  });
});

// update doctor
const updateDoctor = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await doctorService.updateDoctorIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor updated successfully",
    data: result,
  });
});

// delete doctor
const deleteDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await doctorService.deleteDoctorFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});
// soft delete
const softDeleteDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await doctorService.softDeleteDoctorFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

export const doctorController = {
  getAllDoctor,
  getSingleDoctor,
  deleteDoctor,
  softDeleteDoctor,
  updateDoctor,
};
