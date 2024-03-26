import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import pick from "../../utils/pick";
import { adminFilterableFields } from "./admin.constant";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";

const getAllAdmin = catchAsync(async (req, res) => {
  const filters = pick(req?.query, adminFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  // console.log("options", options);
  const result = await adminService.getAllAdminFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin retrieved successfully",
    meta: result?.meta,
    data: result?.data,
  });
});

// get single admin
const getSingleAdmin = catchAsync(async (req, res) => {
  const result = await adminService.getSingleAdminFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin retrieved successfully",
    data: result,
  });
});

// update admin
const updateAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.updateAdminIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});

// delete admin
const deleteAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteAdminFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

// soft delete
const softDeleteAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.softDeleteAdminFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const adminController = {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};
