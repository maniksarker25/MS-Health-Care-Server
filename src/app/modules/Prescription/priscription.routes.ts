import express from "express";
import { prescriptionController } from "./priscription.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-prescription",
  auth(UserRole.PATIENT),
  prescriptionController.getMyAllPrescription
);
router.post(
  "/",
  auth(UserRole.DOCTOR),
  prescriptionController.createPrescription
);

export const prescriptionRoutes = router;
