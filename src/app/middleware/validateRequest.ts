import { AnyZodObject } from './../../../node_modules/zod/src/v3/types';
import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest = (schema: ZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const parsebody = req.body.data ? JSON.parse(req.body.data) : req.body;

            const parseData = schema.parse(parsebody)

            req.body = parseData

            next()
        } catch (error) {
            next(error)
        }
    }

}
export default validateRequest;