import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  return res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Api Not found",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found",
    },
  });
};

export default notFound;
