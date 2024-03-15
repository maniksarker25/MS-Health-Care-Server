import { Request, Response } from "express";
import { userService } from "./user.service";

const createAdmin = async (req: Request, res: Response) => {
  const result = await userService.createAdminIntoDB(req.body);
  res.send(result);
};

export const userController = {
  createAdmin,
};
