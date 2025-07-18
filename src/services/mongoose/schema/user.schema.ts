import {Schema} from "mongoose";
import {User, UserRole} from "../../../models";

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
        address: {
            street: {
                type: String,
                required: false
            },
            city: {
                type: String,
                required: false
            },
            zipCode: {
                type: String,
                required: false
            },
            country: {
                type: String,
                required: false
            }
        },
        bio: {
            type: String,
            required: false
        },
        socialLinks: {
            instagram: {
                type: String,
                required: false
            },
            facebook: {
                type: String,
                required: false
            },
            twitter: {
                type: String,
                required: false
            }
        }
    }, {
        timestamps: true, // createdAt + updatedAt
        collection: "users",
        versionKey: false, // désactive le versionning de model
    });
}