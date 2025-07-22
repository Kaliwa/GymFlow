import { Schema } from "mongoose";
import {
  ChallengeParticipation,
  ParticipationStatus,
} from "../../../models/challenge-participation.interface";

export function challengeParticipationSchema(): Schema<ChallengeParticipation> {
  return new Schema<ChallengeParticipation>(
    {
      challengeId: {
        type: String,
        ref: "Challenge",
        required: true,
      },
      userId: {
        type: String,
        ref: "User",
        required: true,
      },
      invitedBy: {
        type: String,
        ref: "User",
        required: false,
      },
      status: {
        type: String,
        enum: ["INVITED", "JOINED", "COMPLETED", "ABANDONED"],
        default: ParticipationStatus.INVITED,
        required: true,
      },
      joinedAt: {
        type: Date,
        required: false,
      },
      completedAt: {
        type: Date,
        required: false,
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      workoutCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      timestamps: true,
      collection: "challenge_participations",
      versionKey: false,
    }
  );
}
