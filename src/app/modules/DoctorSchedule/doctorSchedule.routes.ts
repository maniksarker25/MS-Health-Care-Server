import express from "express";
import { doctorScheduleController } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-schedules",
  auth(UserRole.DOCTOR),
  doctorScheduleController.getMySchedule
);
router.get(
  "/",
  // auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  doctorScheduleController.getAllDoctorSchedule
);
router.post(
  "/",
  auth(UserRole.DOCTOR),
  doctorScheduleController.createDoctorSchedule
);
router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  doctorScheduleController.deleteDoctorSchedule
);
export const doctorScheduleRoutes = router;
