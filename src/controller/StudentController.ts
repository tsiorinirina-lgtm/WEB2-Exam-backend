import type { Request, Response } from 'express';
import type { User } from '../models/User.ts';
import { BadRequestError } from '../errors/BadRequest.ts';
import { NotFoundError } from '../errors/NotFound.ts';
import { InternalServerError } from '../errors/InternalServer.ts';

const parseId = (raw: string): number | null => {
    const id = Number(raw);
    return Number.isInteger(id) && id >= 1 ? id : null;
};

export const listStudents = (req: Request, res: Response): void => {
    try {
        const students: User[] = [];
        res.status(200).json(students);
    } catch (error) {
        if (error instanceof InternalServerError) {
            res.status(500).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
