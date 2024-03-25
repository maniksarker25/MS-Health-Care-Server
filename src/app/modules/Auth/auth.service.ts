import { UserStatus } from "@prisma/client";
import generateToken from "../../helpers/generateToken";
import prisma from "../../utils/prisma";
import { TLoginUser } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
const loginUserIntoDB = async (payload: TLoginUser) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    user?.password
  );

  if (!isPasswordMatched) {
    throw new Error("Password does not matched");
  }

  const jwtPayload = {
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
const changePasswordIntoDB = async (user, payload: any) => {
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

export const authService = {
  loginUserIntoDB,
  refreshToken,
  changePasswordIntoDB,
};
