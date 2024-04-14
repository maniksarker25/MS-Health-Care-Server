import express from "express";
import { paymentController } from "./payment.controller";

const router = express.Router();

router.post("/", paymentController.initPayment);

export const paymentRoutes = router;
