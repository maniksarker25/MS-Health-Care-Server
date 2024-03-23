import { UserStatus } from "@prisma/client";
import generateToken from "../../helpers/generateToken";
import prisma from "../../utils/prisma";
import { TLoginUser } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
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
  const accessToken = generateToken(jwtPayload, "abcdefg", "15m");
  const refreshToken = generateToken(jwtPayload, "efghij", "30d");

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

export const authService = {
  loginUserIntoDB,
  refreshToken,
};
