import { Request, Response, NextFunction } from "express";
export declare function RequestValidator<T extends object>(dtoClass: new () => T, type: 'body' | 'params' | 'query'): (req: Request, res: Response, next: NextFunction) => void;
