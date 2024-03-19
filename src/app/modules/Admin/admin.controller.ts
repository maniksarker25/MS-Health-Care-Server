import { Request, Response } from "express";
import { adminService } from "./admin.service";
import pick from "../../utils/pick";
import { adminFilterableFields } from "./admin.constant";

const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const filters = pick(req?.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    console.log("options", options);
    const result = await adminService.getAllAdminFromDB(filters, options);
    res.status(200).json({
      success: true,
      message: "Admin retrieved successfully",
      meta: result?.meta,
      data: result?.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};

// get single admin
const getSingleAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getSingleAdminFromDB(req.params.id);
    res.status(200).json({
      success: true,
      message: "Admin retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};

// update admin
const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateAdminIntoDB(id, req.body);
    res.status(200).json({
      success: true,
      message: "Admin data updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};

// delete admin
const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteAdminFromDB(id);
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};
export const adminController = {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
};
