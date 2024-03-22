import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import catchAsync from "../utils/catchAsync";

// const validateRequest = (schema: AnyZodObject) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await schema.parseAsync({
//         body: req.body,
//       });
//       return next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };

// use catch async function -------------
const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // if everything is alright next()=>
    await schema.parseAsync({
      body: req.body,
      //   cookies: req.cookies,
    });
    return next();
  });
};

export default validateRequest;
