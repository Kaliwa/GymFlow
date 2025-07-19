import { Schema } from "mongoose";
import { Gym, GymStatus } from "../../../models";
import { addressSchema } from "./address.schema";
import { contactInfoSchema } from "./contact-info.schema";

export function gymSchema(): Schema<Gym> {
    return new Schema<Gym>({
        ownerId: {
            type: String,
            required: true,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        address: addressSchema(true),
        contactInfo: contactInfoSchema(true),
        capacity: {
            type: Number,
            required: true
        },
        equipments: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
        images: {
            type: [String],
            required: true,
            default: []
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(GymStatus),
            default: GymStatus.PENDING
        },
        submittedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        reviewedAt: {
            type: Date,
            required: false
        },
        approvedAt: {
            type: Date,
            required: false
        },
        suspendedAt: {
            type: Date,
            required: false
        },
        closedAt: {
            type: Date,
            required: false
        },
        reviewedBy: {
            type: String,
            required: false,
            ref: 'User'
        },
        approvalNotes: {
            type: String,
            required: false
        },
        rejectionReason: {
            type: String,
            required: false
        },
        suspensionReason: {
            type: String,
            required: false
        },
        isActive: {
            type: Boolean,
            required: false,
            default: true
        },
        rating: {
            type: Number,
            required: false,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            required: false,
            default: 0
        }
    }, {
        timestamps: true,
        collection: "gyms",
        versionKey: false,
    });
}
