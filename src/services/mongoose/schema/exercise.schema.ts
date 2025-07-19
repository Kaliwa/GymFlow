import { Schema } from "mongoose";
import { Exercise } from "../../../models/exercise.interface";

export function exerciseSchema(): Schema<Exercise> {
  return new Schema<Exercise>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    targetMuscles: [{ type: String }],
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    type: { type: String, enum: ["strength", "cardio", "flexibility", "balance"], required: true },
    isPublic: { type: Boolean, required: true },
    equipments: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
  }, {
    timestamps: true,
    collection: "exercises"
  });
}
