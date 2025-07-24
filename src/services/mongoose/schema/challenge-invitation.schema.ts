import { Schema } from "mongoose";
import { ChallengeInvitation } from "../../../models/challenge-participation.interface";

export function challengeInvitationSchema(): Schema<ChallengeInvitation> {
  return new Schema<ChallengeInvitation>(
    {
      challengeId: {
        type: String,
        ref: "Challenge",
        required: true,
      },
      inviterId: {
        type: String,
        ref: "User",
        required: true,
      },
      inviteeId: {
        type: String,
        ref: "User",
        required: true,
      },
      message: {
        type: String,
        required: false,
      },
      respondedAt: {
        type: Date,
        required: false,
      },
      status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "DECLINED"],
        default: "PENDING",
        required: true,
      },
    },
    {
      timestamps: true,
      collection: "challenge_invitations",
      versionKey: false,
    }
  );
}
