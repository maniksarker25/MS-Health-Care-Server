import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";
import AppError from "../../errors/appError";
import config from "../../config";

const loginUser = catchAsync(async (req, res) => {
  const result = await authService.loginUserIntoDB(req.body);
  const { refreshToken, accessToken, needPasswordChange } = result;

  // res.cookie("refreshToken", refreshToken, {
  //   secure: false,
  //   httpOnly: true,
  //   sameSite: "none",
  //   maxAge: 1000 * 60 * 60 * 24 * 265,
  // });
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);
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
  // set refresh token into cookie
  // const cookieOptions = {
  //   secure: config.env === "production",
  //   httpOnly: true,
  // };

  // res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is retrieved successfully",
    data: result,
  });
});
// change password
const changePassword = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await authService.changePasswordIntoDB(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

// forget password
const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = authService.forgetPasswordIntoDB(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Check your email",
    data: result,
  });
});

// reset password
const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization || "";
  await authService.resetPasswordIntoDB(req.body, token);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account recovered!",
    data: {
      status: 200,
      message: "Password Reset Successfully",
    },
  });
});

export const authController = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
