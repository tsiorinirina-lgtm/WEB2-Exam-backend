import type { Express, Request, Response } from "express";
import { CourseController } from "./src/controllers/CourseController.ts";
import express from "express";
import "dotenv/config";
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
new CourseController(app);

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});

app.get("/", (req: Request, res: Response) => {
  res.send("App is running");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
