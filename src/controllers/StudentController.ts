import type { Request, Response, Express } from 'express';
import type { User } from '../models/User.ts';
import { BadRequestError } from '../errors/BadRequest.ts';
import { NotFoundError } from '../errors/NotFound.ts';
import { InternalServerError } from '../errors/InternalServer.ts';
import { HttpError } from '../errors/HttpError.ts';
import { StudentService } from "../services/StudentService.ts";
import { authenticateUser, authorizeUser } from "../security/AuthMiddleware.ts";
import { validateStudentCreation } from "../middlewares/StudentValidationMiddleware.ts";

export class StudentController {
    private studentService : StudentService;

    constructor (app:Express){
        this.studentService = new StudentService();
        this.setupRoutes(app);
    }

    private setupRoutes (app : Express) {
        app.get("/api/students",authenticateUser, authorizeUser("admin"), (req:Request , res:Response) => {
            this.getAll(res,req)
        });

        app.post("/api/student", authenticateUser, authorizeUser("admin"), validateStudentCreation, (req:Request, res:Response) => {
            this.create(res, req)
        });

        app.put("/api/student/:id", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.update(res, req)
        });

        app.delete("/api/student/:id", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.delete(res, req)
        });
    }

    private async getAll (res: Response, req: Request) {
        try {
            const students = await this.studentService.getAll();
            res.status(200).json(students);
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
            const student = await this.studentService.create(req.body);
            res.status(201).json(student);
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
            const student = await this.studentService.update(Number(req.params.id), req.body);
            res.status(200).json(student);
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
            const student = await this.studentService.delete(Number(req.params.id));
            res.status(200).json(student);
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