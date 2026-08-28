import type { Express, Request, Response } from "express";
import { CourseController } from "./src/controllers/CourseController.ts";
import { ExamController } from "./src/controllers/ExamController.ts";
import type { AuthenticatedUser } from "./src/models/User.ts";
import { QuestionController } from "./src/controllers/QuestionController.ts";
import express from "express";
import cors from "cors";
import "dotenv/config";
import { AuthController } from "./src/controllers/AuthController.ts";
import { MyController } from "./src/controllers/MyController.ts";
const app: Express = express();
const allowedOrigins = (process.env.FRONTEND_URLS ??
  "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
new AuthController(app);
new QuestionController(app);
new MyController(app);
const port = process.env.PORT || 3000;

app.use(express.json());
new CourseController(app);

new ExamController(app);
app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});

app.get("/", (req: Request, res: Response) => {
  res.send("App is running");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
