import { Schema } from "mongoose";
import { Address } from "../../../models/common.interface";

export function addressSchema(required: boolean = false): Schema<Address> {
    return new Schema<Address>({
        street: {
            type: String,
            required: required
        },
        city: {
            type: String,
            required: required
        },
        zipCode: {
            type: String,
            required: required
        },
        country: {
            type: String,
            required: required
        }
    }, { _id: false });
}
