import express, { NextFunction, Request, Response } from "express";
import { specialtiesController } from "./specialties.controller";
import { fileUploader } from "../../helpers/fileUploader";
import { specialtiesValidation } from "./specialties.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", specialtiesController.getAllSpecialties);

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = specialtiesValidation.crateSpecialtiesValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return specialtiesController.crateSpecialties(req, res, next);
  }
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  specialtiesController.deleteSpecialties
);

export const specialtiesRoutes = router;
