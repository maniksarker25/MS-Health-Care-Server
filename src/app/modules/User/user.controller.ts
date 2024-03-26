import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { password, admin: adminData } = req.body;
  try {
    const result = await userService.createAdminIntoDB(
      req.file,
      password,
      adminData
    );
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error,
    });
  }
};

// create doctor
const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, doctor: doctorData } = req.body;

    const result = await userService.createDoctorIntoDB(
      req.file,
      password,
      doctorData
    );
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Doctor created successfully",
      data: result,
    });
  }
);

export const userController = {
  createAdmin,
  createDoctor,
};
