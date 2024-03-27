import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import pick from "../../utils/pick";
import sendResponse from "../../utils/sendResponse";
import { userFilterableFields } from "./user.constant";

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

// create patient
const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, patient: patientData } = req.body;

    const result = await userService.createPatientIntoDB(
      req.file,
      password,
      patientData
    );
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Patient created successfully",
      data: result,
    });
  }
);

// get all user from db
const getAllUser = catchAsync(async (req, res) => {
  const filters = pick(req?.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  // console.log("options", options);
  const result = await userService.getAllUserFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    meta: result?.meta,
    data: result?.data,
  });
});
export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUser,
};
