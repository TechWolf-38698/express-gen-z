import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

export function RequestValidator<T extends object>(
  dtoClass: new () => T,  type: 'body'| 'params'| 'query'
): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction) => {
    
    if (!req?.[type]) {
      return res
        .status(400)
        .json({ error: "Request body is missing or malformed" });
    }
    const dtoInstance = plainToClass(dtoClass, req?.[type]);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}))
        .flat();
      return res.status(400).json({ errors: errorMessages });
    }
    req[type] = dtoInstance;
    next();
  };
}
