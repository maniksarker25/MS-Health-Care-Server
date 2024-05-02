import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { doctorController } from "./doctor.controller";

const router = express.Router();
router.get(
  "/",
  //! TODO
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  doctorController.getAllDoctor
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  doctorController.getSingleDoctor
);

router.patch("/:id", doctorController.updateDoctor);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  doctorController.deleteDoctor
);
router.delete(
  "/softDelete/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  doctorController.softDeleteDoctor
);

export const doctorRoutes = router;
