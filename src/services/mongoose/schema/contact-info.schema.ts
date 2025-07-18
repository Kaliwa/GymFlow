import { Schema } from "mongoose";
import { ContactInfo } from "../../../models/common.interface";

export function contactInfoSchema(required: boolean = false): Schema<ContactInfo> {
    return new Schema<ContactInfo>({
        phone: {
            type: String,
            required: required
        },
        email: {
            type: String,
            required: required
        },
        website: {
            type: String,
            required: false
        }
    }, { _id: false });
}
