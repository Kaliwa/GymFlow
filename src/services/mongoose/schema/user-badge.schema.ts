import { Schema } from "mongoose";
import { UserBadge } from "../../../models/badge.interface";

export function userBadgeSchema(): Schema<UserBadge> {
  return new Schema<UserBadge>(
    {
      userId: {
        type: String,
        ref: "User",
        required: true,
      },
      badgeId: {
        type: String,
        ref: "Badge",
        required: true,
      },
      awardedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      progress: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
      },
      metadata: {
        type: Schema.Types.Mixed,
        required: false,
      },
    },
    {
      timestamps: true,
      collection: "user_badges",
      versionKey: false,
    }
  );
}
