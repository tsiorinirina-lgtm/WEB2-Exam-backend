import type { Request, Response, Express } from 'express';
import type { User } from '../models/User.ts';
import { BadRequestError } from '../errors/BadRequest.ts';
import { NotFoundError } from '../errors/NotFound.ts';
import { InternalServerError } from '../errors/InternalServer.ts';
import { HttpError } from '../errors/HttpError.ts';
import { ExamService } from "../services/ExamService.ts";
import { authenticateUser, authorizeUser } from "../security/AuthMiddleware.ts";

export class ExamController {
    private examService : ExamService;
    constructor (app:Express){
        this.examService = new ExamService();
        this.setupRoutes(app);
    }

    private setupRoutes (app : Express) {
        app.get("/api/exams", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.getAll(res, req)
        });

        app.post("/api/exams", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.create(res, req)
        });

        app.get("/api/exams/:id", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.getById(res, req)
        });

        app.put("/api/exams/:id", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.update(res, req)
        });

        app.delete("/api/exams/:id", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.delete(res, req)
        });

        app.get("/api/exams/:id/results", authenticateUser, authorizeUser("admin"), (req:Request, res:Response)=>{
            this.getResults(res,req)
        });
    }
}