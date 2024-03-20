import { Request, Response } from "express";
import { userService } from "./user.service";
import httpStatus from "http-status";

const createAdmin = async (req: Request, res: Response) => {
  try {
    const result = await userService.createAdminIntoDB(req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Admin created successfully",
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

export const userController = {
  createAdmin,
};
