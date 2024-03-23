import express, { Application, Request, Response, urlencoded } from "express";
import cors from "cors";
import { userRoutes } from "./app/modules/User/user.routes";
import { adminRoutes } from "./app/modules/Admin/admin.routes";
import router from "./app/routes";
import { NextFunction } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
const app: Application = express();
app.use(cors());
app.use(cookieParser());
// parser ----------------------------------------------------------------
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Ms health care server");
});

app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
