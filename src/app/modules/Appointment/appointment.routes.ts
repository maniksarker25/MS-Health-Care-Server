import express from "express";
import { appointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-appointment",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  appointmentController.getMyAllAppointment
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  appointmentController.createAppointment
);

export const appointmentRoutes = router;
