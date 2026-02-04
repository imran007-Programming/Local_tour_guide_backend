

import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
// import { Prisma } from "../../../prisma/src/generated/prisma";
const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let error = err;
    let message = err.message || "Something Went Wrong";
    let success = false;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            message = "Duplicate key error"
            error = err.meta
            statusCode = httpStatus.CONFLICT
        }
        if (err.code === "P100") {
            message = "Authentication failed againist databse server"
            error = err.meta
            statusCode = httpStatus.BAD_GATEWAY
        }
        if (err.code === "P2003") {
            message = "Foreign Key constraint failed"
            error = err.meta
            statusCode = httpStatus.BAD_REQUEST
        }
    }

    else if (err instanceof Prisma.PrismaClientValidationError) {
        message = "validation Error"
        error = err.message
        statusCode = httpStatus.BAD_REQUEST
    }
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        message = "Unknown Prisma Error occured"
        error = err.message
    }
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        message = "Prisma client failed to initilized"
        error = err.message
    }

    res.status(statusCode).json({
        success,
        error,
        message,
    });
};

export default globalErrorHandler;
