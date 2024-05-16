import { UserStatus } from "@prisma/client";
import generateToken from "../../helpers/generateToken";
import prisma from "../../utils/prisma";
import { TLoginUser } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
import { sendEmail } from "../../utils/sendEmail";
const loginUserIntoDB = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    user?.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password does not matched");
  }

  const jwtPayload = {
    id: user?.id,
    email: user?.email,
    role: user?.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  const refreshToken = generateToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user?.needPasswordChange,
  };
};

// refresh token
const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = (await jwt.verify(token, "efghij")) as JwtPayload;
  } catch (error) {
    throw new Error("You are not authenticated");
  }
  const user = await prisma.user.findUnique({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });
  const jwtPayload = {
    email: user?.email,
    role: user?.role,
  };
  const accessToken = generateToken(jwtPayload, "abcdefg", "15m");
  return { accessToken };
};

// change password
const changePasswordIntoDB = async (
  user: any,
  payload: { currentPassword: string; newPassword: string }
) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const isPasswordMatched = await bcrypt.compare(
    payload?.currentPassword,
    userData?.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not matched");
  }
  const hashedPassword = await bcrypt.hash(payload?.newPassword, 12);
  await prisma.user.update({
    where: {
      email: user?.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return null;
};

// forget password into db
const forgetPasswordIntoDB = async (email: string) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const jwtPayload = {
    email: userData?.email,
    role: userData?.role,
  };
  const resetToken = generateToken(
    jwtPayload,
    config.jwt_reset_pass_secret as string,
    config.jwt_reset_pass_token_expires_in as string
  );
  const resetUiLink = `${config.reset_password_ui_link}?email=${userData.email}&token=${resetToken}`;
  // console.log(resetUiLink);
  await sendEmail(
    userData?.email,
    `
    <div>
      <p>Dear user</p>
      <p>Your password reset link here ,Click here <a href=${resetUiLink}>
      <button>Reset Password</button>
      </a></p>
    </div>

    `
  );
};

// reset password into db
const resetPasswordIntoDB = async (
  token: string,
  payload: { email: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  // verify token -------------
  const decoded = jwt.verify(
    token,
    config.jwt_reset_pass_secret as string
  ) as JwtPayload;
  // console.log(decoded.userId, payload.id);
  if (decoded?.email !== payload?.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are forbidden to access this"
    );
  }
  //hash new password
  const hashedPassword = await bcrypt.hash(payload.password, 12);
  await prisma.user.update({
    where: {
      email: decoded.email,
      role: decoded.role,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
  return null;
};

export const authService = {
  loginUserIntoDB,
  refreshToken,
  changePasswordIntoDB,
  forgetPasswordIntoDB,
  resetPasswordIntoDB,
};
