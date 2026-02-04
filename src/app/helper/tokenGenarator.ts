import { SignApiOptions } from './../../../node_modules/cloudinary/types/index.d';
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const genarateToken = (payload: JwtPayload, secret: Secret, expiresIn: string) => {
    const Token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: expiresIn,
    } as SignOptions);

    return Token

};
const verifyToken = async (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload
}

export const jwtHelper = {
    genarateToken,
    verifyToken
}