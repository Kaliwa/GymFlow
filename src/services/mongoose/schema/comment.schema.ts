import { Schema } from "mongoose";
import { ChallengeComment } from "../../../models/comment.interface";

export function challengeCommentSchema(): Schema<ChallengeComment> {
  return new Schema<ChallengeComment>({
    challengeId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
  }, {
    timestamps: true,
    collection: "challenge_comments",
    versionKey: false,
  });
} 