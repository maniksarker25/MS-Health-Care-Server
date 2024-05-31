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
import verifyToken from "../../helpers/verifyToken";
import { jwtHelpers } from "../../helpers/jwtHelpers";
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
  console.log("refresh token =>", token);
  let decodedData;
  try {
    decodedData = verifyToken(token, config.jwt_refresh_secret as string);
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized ");
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
  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
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
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist!");
  }

  const passResetToken = await jwtHelpers.createPasswordResetToken({
    id: isUserExist.id,
  });

  const resetLink: string =
    config.reset_password_ui_link +
    `?id=${isUserExist.id}&token=${passResetToken}`;

  await sendEmail(
    email,
    `
  <div>
    <p>Dear ${isUserExist.role},</p>
    <p>Your password reset link: <a href=${resetLink}><button>RESET PASSWORD<button/></a></p>
    <p>Thank you</p>
  </div>
`
  );
};

// reset password into db
const resetPasswordIntoDB = async (
  payload: { id: string; newPassword: string },
  token: string
) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found!");
  }

  const isVarified = verifyToken(token, config.jwt_access_secret as string);

  if (!isVarified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Something went wrong!");
  }

  const password = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

export const authService = {
  loginUserIntoDB,
  refreshToken,
  changePasswordIntoDB,
  forgetPasswordIntoDB,
  resetPasswordIntoDB,
};
