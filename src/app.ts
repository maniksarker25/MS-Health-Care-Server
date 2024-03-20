import express, { Application, Request, Response, urlencoded } from "express";
import cors from "cors";
import { userRoutes } from "./app/modules/User/user.routes";
import { adminRoutes } from "./app/modules/Admin/admin.routes";
import router from "./app/routes";
const app: Application = express();
app.use(cors());
// parser ----------------------------------------------------------------
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Ms health care server");
});

app.use("/api/v1", router);

export default app;
