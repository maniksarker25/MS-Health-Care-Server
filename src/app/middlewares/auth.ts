import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";
import verifyToken from "../helpers/verifyToken";
import config from "../config";
import AppError from "../errors/appError";
import httpStatus from "http-status";

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req?.headers?.authorization;
    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized to access this"
      );
    }
    let decoded;

    try {
      decoded = verifyToken(token, config.jwt_access_secret as string);
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token is expired");
    }
    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token is expired");
    }
    const { role, userId, iat } = decoded;

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are unauthorized");
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
