import express from "express";
import { scheduleController } from "./schedule.controller";

const router = express.Router();

router.post("/", scheduleController.createSchedule);

export const scheduleRoutes = router;
