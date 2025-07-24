import { Mongoose, Model } from "mongoose";
import { ChallengeComment } from "../../../models/comment.interface";

export class ChallengeCommentService {
  readonly commentModel: Model<ChallengeComment>;

  constructor(connection: Mongoose) {
    this.commentModel = connection.model<ChallengeComment>("ChallengeComment");
  }

  async createComment(comment: Omit<ChallengeComment, "_id" | "createdAt" | "updatedAt">) {
    return this.commentModel.create(comment);
  }

  async getCommentsByChallenge(challengeId: string) {
    return this.commentModel.find({ challengeId }).sort({ createdAt: -1 });
  }

  async deleteComment(commentId: string, userId: string) {
    return this.commentModel.deleteOne({ _id: commentId, userId });
  }
} 