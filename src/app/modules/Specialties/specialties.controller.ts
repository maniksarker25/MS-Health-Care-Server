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

export const specialtiesController = {
  crateSpecialties,
};
