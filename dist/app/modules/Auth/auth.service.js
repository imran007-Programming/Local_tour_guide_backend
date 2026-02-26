"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokenGenarator_1 = require("../../helper/tokenGenarator");
const fileUploader_1 = require("../../helper/fileUploader");
const config_1 = __importDefault(require("../../config"));
const client_1 = require("@prisma/client");
const createUser = async (req) => {
    const payload = req.body;
    if (req.file) {
        const uploadResult = await fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        payload.profilePic = uploadResult?.secure_url;
    }
    ///hashed password
    const hashedPassword = await bcryptjs_1.default.hash(String(payload.password), Number(config_1.default.salt));
    try {
        const result = await prisma_1.prisma.$transaction(async (tnx) => {
            const user = await tnx.user.create({
                data: {
                    name: payload.name,
                    email: payload.email,
                    password: hashedPassword,
                    role: payload.role,
                    profilePic: payload.profilePic,
                    bio: payload.bio,
                    languages: payload.languages || [],
                },
            });
            //if user is Guide create Guide
            if (payload.role === client_1.Role.GUIDE) {
                await tnx.guide.create({
                    data: {
                        userId: user.id,
                        expertise: payload.expertise,
                        dailyRate: payload.dailyRate
                    }
                });
            }
            if (payload.role === client_1.Role.TOURIST) {
                await tnx.tourist.create({
                    data: {
                        userId: user.id,
                        preferences: payload.preferences || [],
                    },
                });
            }
            return user;
        });
        return result;
    }
    catch (error) {
        if (error.code === 'P2002') {
            throw new ApiError_1.default(http_status_1.default.CONFLICT, "Email already exists");
        }
        throw error;
    }
};
const login = async (payload) => {
    const user = await prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email
        }
    });
    const isCorrectPassword = await bcryptjs_1.default.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "password is incorrect");
    }
    const accessToken = tokenGenarator_1.jwtHelper.genarateToken({ userId: user.id, email: user.email, role: user.role }, config_1.default.ACCESS_TOKEN_SECRET, "15m");
    const refreshToken = tokenGenarator_1.jwtHelper.genarateToken({ userId: user.id, email: user.email, role: user.role }, config_1.default.REFRESH_TOKEN_SECRET, "90d");
    return {
        accessToken,
        refreshToken
    };
};
const getME = async (payload) => {
    return await prisma_1.prisma.user.findUnique({
        where: {
            id: payload.userId
        },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            languages: true,
            profilePic: true,
            role: true,
            guide: true,
            tourist: true,
        }
    });
};
exports.authService = {
    createUser,
    login,
    getME,
};
