import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { specialtiesService } from "./specialties.service";

const crateSpecialties = catchAsync(async (req, res) => {
  const result = await specialtiesService.createSpecialtiesIntoDB(
    req.file!,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Specialties created successfully",
    data: result,
  });
});

const getAllSpecialties = catchAsync(async (req, res) => {
  const result = await specialtiesService.getAllSpecialtiesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties data fetched successfully",
    data: result,
  });
});
const deleteSpecialties = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await specialtiesService.deleteSpecialtiesFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const specialtiesController = {
  crateSpecialties,
  getAllSpecialties,
  deleteSpecialties,
};
