import { Schema } from "mongoose";
import { Challenge } from "../../../models";

export function challengeSchema() {
  return new Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      gym: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      equipments: [{ type: Schema.Types.ObjectId, ref: "Equipment" }],
      exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
      type: {
        type: String,
        enum: ["INDIVIDUAL", "TEAM", "OPEN"],
        default: "INDIVIDUAL",
      },
      maxParticipants: { type: Number, required: false },
      isPrivate: { type: Boolean, default: false },
      isActive: { type: Boolean, default: false },
      startDate: { type: Date, required: false },
      endDate: { type: Date, required: false },
      requiresInvitation: { type: Boolean, default: false },
    },
    { collection: "challenges", timestamps: true }
  );
}
