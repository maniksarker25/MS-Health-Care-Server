import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../helpers/fileUploader";
import { userValidation } from "./user.validation";

const router = express.Router();

router.post(
  "/create-admin",
  auth("ADMIN", "SUPER_ADMIN"),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createAdminValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return userController.createAdmin(req, res, next);
  }
);
router.post(
  "/create-doctor",
  auth("ADMIN", "SUPER_ADMIN"),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createDoctorValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return userController.createDoctor(req, res, next);
  }
);

export const userRoutes = router;
