import { Schema } from "mongoose";
import { Badge, BadgeType, BadgeRarity } from "../../../models/badge.interface";

export function badgeSchema(): Schema<Badge> {
    return new Schema<Badge>({
        name: { 
            type: String, 
            required: true, 
            unique: true 
        },
        description: { 
            type: String, 
            required: true 
        },
        icon: { 
            type: String, 
            required: true 
        },
        color: { 
            type: String, 
            required: true 
        },
        type: { 
            type: String, 
            enum: Object.values(BadgeType), 
            required: true 
        },
        rarity: { 
            type: String, 
            enum: Object.values(BadgeRarity), 
            required: true,
            default: BadgeRarity.COMMON
        },
        points: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        rules: [{
            type: {
                type: String,
                enum: ['workout_count', 'challenge_completed', 'streak_days', 'calories_burned', 'gym_visits', 'custom'],
                required: true
            },
            operator: {
                type: String,
                enum: ['eq', 'gt', 'gte', 'lt', 'lte', 'between'],
                required: true
            },
            value: {
                type: Schema.Types.Mixed,
                required: true
            },
            timeframe: {
                type: String,
                enum: ['daily', 'weekly', 'monthly', 'yearly', 'all_time'],
                required: false
            },
            additionalCriteria: {
                type: Schema.Types.Mixed,
                required: false
            }
        }],
        isActive: { 
            type: Boolean, 
            required: true, 
            default: true 
        },
        createdBy: { 
            type: String, 
            ref: 'User', 
            required: true 
        }
    }, {
        timestamps: true,
        collection: "badges",
        versionKey: false,
    });
}
