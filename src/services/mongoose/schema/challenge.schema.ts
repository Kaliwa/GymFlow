import { Schema } from "mongoose";
import { Challenge } from "../../../models";

export function challengeSchema(): Schema<Challenge> {
  return new Schema<Challenge>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    gym: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    equipments: [{ type: Schema.Types.ObjectId, ref: "Equipment" }],
    exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    isActive: { type: Boolean, default: false }
  }, { collection: "challenges", timestamps: true });
}
