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

export const createStudent = (req: Request, res: Response): void => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        throw new BadRequestError('name, email and password are required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new BadRequestError('Invalid email format');
    }
    if (password.length < 6) {
        throw new BadRequestError('Password must be at least 6 characters');
    }
    try {
        const student: User = {
            id: 1,
            name: name.trim(),
            email: email.trim(),
            password_hash: 'hashed_password_here',
            is_active: true,
            joined_at: new Date(),
            role: 'student'
        };
        res.status(201).json(student);
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            res.status(409).json({ message: 'Email already in use' });
            return;
        }
    }
    if (error instanceof InternalServerError) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateStudent = (req: Request, res: Response): void => {
    const id = parseId(req.params.id);
    if (id === null) {
        throw new BadRequestError('Invalid student ID');
    }
    const { name, email, is_active, password } = req.body;
    if (!name && !email && is_active === undefined && !password) {
        throw new BadRequestError('At least one field must be provided for update');
    }
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestError('Invalid email format');
        }
    }
    if (password && password.length < 6) {
        throw new BadRequestError('Password must be at least 6 characters');
    }
    try {
        const student: User = {
            id,
            name: name?.trim() || 'John Doe',
            email: email?.trim() || 'john@example.com',
            password_hash: password ? 'hashed_new_password' : 'hashed_password_here',
            is_active: is_active ?? true,
            joined_at: new Date(),
            role: 'student'
        };
        res.status(200).json(student);
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
            return;
        }
        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
                res.status(409).json({ message: 'Email already in use by another account' });
                return;
            }
        }
        if (error instanceof InternalServerError) {
            res.status(500).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
