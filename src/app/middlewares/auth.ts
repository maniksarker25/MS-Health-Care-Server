import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";
import verifyToken from "../helpers/verifyToken";
import config from "../config";

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req?.headers?.authorization;
    if (!token) {
      throw new Error("You are not authorized to access this");
    }
    let decoded;

    try {
      decoded = verifyToken(token, config.jwt_access_secret as string);
    } catch (err) {
      throw new Error("Token is expired");
    }
    if (!decoded) {
      throw new Error("Token is expired");
    }
    const { role, userId, iat } = decoded;

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new Error("Your are not authorized");
    }
    next();
  });
};

export default auth;
