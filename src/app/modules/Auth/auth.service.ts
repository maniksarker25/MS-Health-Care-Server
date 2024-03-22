import generateToken from "../../helpers/generateToken";
import prisma from "../../utils/prisma";
import { TLoginUser } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const loginUserIntoDB = async (payload: TLoginUser) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
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

export const authService = {
  loginUserIntoDB,
};
