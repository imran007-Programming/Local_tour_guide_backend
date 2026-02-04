import { Role } from "@prisma/client";

export type TUser = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    profilePic?: string | null;
    bio?: string | null;
    languages: string[];
    createdAt: Date;
    updatedAt: Date;
}