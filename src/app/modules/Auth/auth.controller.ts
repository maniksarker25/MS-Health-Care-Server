import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  const result = await authService.loginUserIntoDB(req.body);
  const { refreshToken, accessToken, needPasswordChange } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 265,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User login successfully",
    data: {
      accessToken,
      needPasswordChange,
    },
  });
});

// refresh token ----------
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is retrieved successfully",
    data: result,
  });
});

export const authController = {
  loginUser,
  refreshToken,
};
