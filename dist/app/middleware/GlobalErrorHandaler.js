"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
// import { Prisma } from "../../../prisma/src/generated/prisma";
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR;
    let error = err;
    let message = err.message || "Something Went Wrong";
    let success = false;
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            message = "Duplicate key error";
            error = err.meta;
            statusCode = http_status_1.default.CONFLICT;
        }
        if (err.code === "P100") {
            message = "Authentication failed againist databse server";
            error = err.meta;
            statusCode = http_status_1.default.BAD_GATEWAY;
        }
        if (err.code === "P2003") {
            message = "Foreign Key constraint failed";
            error = err.meta;
            statusCode = http_status_1.default.BAD_REQUEST;
        }
    }
    else if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        message = "validation Error";
        error = err.message;
        statusCode = http_status_1.default.BAD_REQUEST;
    }
    else if (err instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        message = "Unknown Prisma Error occured";
        error = err.message;
    }
    else if (err instanceof client_1.Prisma.PrismaClientInitializationError) {
        message = "Prisma client failed to initilized";
        error = err.message;
    }
    res.status(statusCode).json({
        success,
        error,
        message,
    });
};
exports.default = globalErrorHandler;
