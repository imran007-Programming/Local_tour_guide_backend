"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const parsebody = req.body.data ? JSON.parse(req.body.data) : req.body;
            const parseData = schema.parse(parsebody);
            req.body = parseData;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = validateRequest;
