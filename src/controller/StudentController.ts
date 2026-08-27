import type { Request, Response, Express } from 'express';
import type { User } from '../models/User.ts';
import { BadRequestError } from '../errors/BadRequest.ts';
import { NotFoundError } from '../errors/NotFound.ts';
import { InternalServerError } from '../errors/InternalServer.ts';
import { StudentService } from "../services/StudentService.ts";
import { authenticateUser, authorizeUser } from "../security/AuthMiddleware.ts";

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

        app.post("/api/student", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.create(res, req)
        });

        app.put("/api/student/:id", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.update(res, req)
        });

        app.delete("/api/student/:id", authenticateUser, authorizeUser("admin"), (req:Request, res:Response) => {
            this.delete(res, req)
        });
    }
}