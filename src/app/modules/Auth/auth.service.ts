import httpStatus from 'http-status';
import ApiError from "../../error/ApiError"
import { prisma } from "../../lib/prisma"
import bcrypt from "bcryptjs"
import { jwtHelper } from '../../helper/tokenGenarator';
import { fileUploader } from '../../helper/fileUploader';
import config from '../../config';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const createUser = async (req: Request) => {
    const payload = req.body

    if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file);
        payload.profilePic = uploadResult?.secure_url;
    }
    ///hashed password
    const hashedPassword = await bcrypt.hash(
        String(payload.password),
        Number(config.salt)
    )

    try {
        const result = await prisma.$transaction(async (tnx: any) => {
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
            if (payload.role === Role.GUIDE) {
                await tnx.guide.create({
                    data: {
                        userId: user.id,
                        expertise: payload.expertise,
                        dailyRate: payload.dailyRate
                    }
                })
            }

            if (payload.role === Role.TOURIST) {
                await tnx.tourist.create({
                    data: {
                        userId: user.id,
                        preferences: payload.preferences || [],
                    },
                });
            }
            return user;
        })

        return result
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new ApiError(httpStatus.CONFLICT, "Email already exists")
        }
        throw error
    }
}


const login = async (payload: any) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email
        }
    })
    const isCorrectPassword = await bcrypt.compare(payload.password, user.password)
    if (!isCorrectPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, "password is incorrect")
    }
    const accessToken = jwtHelper.genarateToken({ userId: user.id, email: user.email, role: user.role }, config.ACCESS_TOKEN_SECRET, "1m")
    const refreshToken = jwtHelper.genarateToken({ userId: user.id, email: user.email, role: user.role }, config.REFRESH_TOKEN_SECRET, "90d");
    return {
        accessToken,
        refreshToken
    }
}

const getME = async (payload: JwtPayload) => {
    return await prisma.user.findUnique({
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
    })


}




export const authService = {
    createUser,
    login,
    getME,

}