import type { Express, Request, Response } from "express";
import type { AuthenticatedUser } from "./src/models/User.ts";
import { QuestionController } from "./src/controllers/QuestionController.ts";
import express from "express";
import "dotenv/config";
import { AuthController } from "./src/controllers/AuthController.ts";
const app: Express = express();
app.use(express.json());
new AuthController(app);
new QuestionController(app);
const port = process.env.PORT || 3000;

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});

app.get("/", (req: Request, res: Response) => {
  res.send("App is running");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
