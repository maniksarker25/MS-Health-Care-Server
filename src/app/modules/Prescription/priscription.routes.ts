import express from "express";
import { prescriptionController } from "./priscription.controller";

const router = express.Router();

router.post("/", prescriptionController.createPrescription);

export const prescriptionRoutes = router;
