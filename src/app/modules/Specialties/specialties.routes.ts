import express, { NextFunction, Request, Response } from "express";
import { specialtiesController } from "./specialties.controller";
import { fileUploader } from "../../helpers/fileUploader";
import { specialtiesValidation } from "./specialties.validation";

const router = express.Router();

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

export const specialtiesRoutes = router;
