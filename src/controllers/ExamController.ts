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

    private async getAll (res: Response, req: Request) {
        try {
            const exams = await this.examService.getAll();
            res.status(200).json(exams);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                const internalError = new InternalServerError();
                res.status(internalError.statusCode).json({ message: internalError.message });
            }
        }
    }

    private async create (res: Response, req: Request) {
        try {
            const exam = await this.examService.create(req.body);
            res.status(201).json(exam);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                const internalError = new InternalServerError();
                res.status(internalError.statusCode).json({ message: internalError.message });
            }
        }
    }

    private async getById (res: Response, req: Request) {
        try {
            const exam = await this.examService.getById(Number(req.params.id));
            res.status(200).json(exam);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                const internalError = new InternalServerError();
                res.status(internalError.statusCode).json({ message: internalError.message });
            }
        }
    }

    private async update (res: Response, req: Request) {
        try {
            const exam = await this.examService.update(Number(req.params.id), req.body);
            res.status(200).json(exam);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                const internalError = new InternalServerError();
                res.status(internalError.statusCode).json({ message: internalError.message });
            }
        }
    }

    private async delete (res: Response, req: Request) {
        try {
            const exam = await this.examService.delete(Number(req.params.id));
            res.status(200).json(exam);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                const internalError = new InternalServerError();
                res.status(internalError.statusCode).json({ message: internalError.message });
            }
        }
    }

    private async getResults (res: Response, req: Request) {
        try {
            const results = await this.examService.getResults(Number(req.params.id));
            res.status(200).json(results);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                const internalError = new InternalServerError();
                res.status(internalError.statusCode).json({ message: internalError.message });
            }
        }
    }
}