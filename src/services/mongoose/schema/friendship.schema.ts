import { Schema } from "mongoose";
import {
  Friendship,
  FriendshipStatus,
} from "../../../models/friendship.interface";

export function friendshipSchema(): Schema<Friendship> {
  return new Schema<Friendship>(
    {
      requesterId: {
        type: String,
        ref: "User",
        required: true,
      },
      addresseeId: {
        type: String,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "BLOCKED"],
        default: FriendshipStatus.PENDING,
        required: true,
      },
    },
    {
      timestamps: true,
      collection: "friendships",
      versionKey: false,
    }
  );
}
