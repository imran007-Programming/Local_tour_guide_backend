"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHelper = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const genarateToken = (payload, secret, expiresIn) => {
    const Token = jsonwebtoken_1.default.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: expiresIn,
    });
    return Token;
};
const verifyToken = async (token, secret) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.jwtHelper = {
    genarateToken,
    verifyToken
};
