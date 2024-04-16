import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { metaService } from "./meta.service";

const fetchDashboardMetaData = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await metaService.fetchDashboardMetaDataFromDB(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard meta data retrieved successfully",
    data: result,
  });
});

export const metaController = {
  fetchDashboardMetaData,
};
