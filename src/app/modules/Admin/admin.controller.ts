import { Request, Response } from "express";
import { adminService } from "./admin.service";
import pick from "../../utils/pick";

const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const filters = pick(req?.query, [
      "name",
      "email",
      "contactNumber",
      "searchTerm",
    ]);
    const result = await adminService.getAllAdminFromDB(filters);
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

export const adminController = {
  getAllAdmin,
};
