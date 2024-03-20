import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import pick from "../../utils/pick";
import { adminFilterableFields } from "./admin.constant";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = pick(req?.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    console.log("options", options);
    const result = await adminService.getAllAdminFromDB(filters, options);
    // res.status(200).json({
    //   success: true,
    //   message: "Admin retrieved successfully",
    //   meta: result?.meta,
    //   data: result?.data,
    // });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin retrieved successfully",
      meta: result?.meta,
      data: result?.data,
    });
  } catch (error) {
    // res.status(500).json({
    //   success: false,
    //   message: error?.name || "Something went wrong",
    //   error: error,
    // });
    next(error);
  }
};

// get single admin
const getSingleAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminService.getSingleAdminFromDB(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// update admin
const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateAdminIntoDB(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// delete admin
const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteAdminFromDB(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// soft delete
const softDeleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await adminService.softDeleteAdminFromDB(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const adminController = {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};
