import { Schema } from "mongoose";
import { SocialLinks } from "../../../models/common.interface";

export function socialLinksSchema(): Schema<SocialLinks> {
    return new Schema<SocialLinks>({
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
    }, { _id: false });
}
