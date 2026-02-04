import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";


const notFound = (req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "api not found",
        error: {
            path: req.originalUrl,
            message: "Your Request path is not found",
        },
    });
};
export default notFound;
