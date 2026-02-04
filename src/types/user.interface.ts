import { Role } from "@prisma/client";


export interface IUser {
    userId: string;
    name: string;
    email: string;
    role: Role;
}
