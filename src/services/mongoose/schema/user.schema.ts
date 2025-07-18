import {Schema} from "mongoose";
import {User, UserRole} from "../../../models";
import { addressSchema } from "./address.schema";
import { socialLinksSchema } from "./social-links.schema";

export function userSchema(): Schema<User> {
    return new Schema<User>({
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(UserRole),
            default: UserRole.USER
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true
        },
        avatar: {
            type: String,
            required: false
        },
        dateOfBirth: {
            type: Date,
            required: false
        },
        phoneNumber: {
            type: String,
            required: false
        },
        address: addressSchema(false),
        bio: {
            type: String,
            required: false
        },
        socialLinks: socialLinksSchema()
    }, {
        timestamps: true,
        collection: "users",
        versionKey: false,
    });
}