import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { reviewController } from "./review.controller";

const router = express.Router();

router.post("/", auth(UserRole.PATIENT), reviewController.createReview);

export const reviewRoutes = router;
