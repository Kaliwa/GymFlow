import { Timestamps } from "./timestamps";
import { Address, SocialLinks } from "./common.interface";

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    GYM_OWNER = 'GYM_OWNER', 
    USER = 'USER'
}

export function getUserRoleLevel(role: UserRole): number {
    switch (role) {
        case UserRole.SUPER_ADMIN:
            return 3;
        case UserRole.GYM_OWNER:
            return 2;
        case UserRole.USER:
            return 1;
        default:
            return 0;
    }
}

export interface User extends Timestamps {
    _id: string;
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    avatar?: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    address?: Address;
    bio?: string;
    socialLinks?: SocialLinks;
}