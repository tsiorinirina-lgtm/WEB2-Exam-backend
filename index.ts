import type { Express, Request, Response } from "express";
import { CourseController } from "./src/controllers/CourseController.ts";
import { ExamController } from "./src/controllers/ExamController.ts";
import type { AuthenticatedUser } from "./src/models/User.ts";
import { QuestionController } from "./src/controllers/QuestionController.ts";
import express from "express";
import "dotenv/config";
import { AuthController } from "./src/controllers/AuthController.ts";
import { MyController } from "./src/controllers/MyController.ts";
const app: Express = express();
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
