import { Mongoose, Model, isValidObjectId } from "mongoose";
import {
  Friendship,
  FriendshipStatus,
  Friend,
  FriendRequest,
  User,
} from "../../../models";

export class FriendshipService {
  readonly friendshipModel: Model<Friendship>;
  readonly userModel: Model<User>;

  constructor(public readonly _connection: Mongoose) {
    this.friendshipModel = _connection.model<Friendship>("Friendship");
    this.userModel = _connection.model<User>("User");
  }

  async sendFriendRequest(
    requesterId: string,
    addresseeId: string
  ): Promise<Friendship | null> {
    if (!isValidObjectId(requesterId) || !isValidObjectId(addresseeId)) {
      return null;
    }

    if (requesterId === addresseeId) {
      return null;
    }

    const existingFriendship = await this.friendshipModel.findOne({
      $or: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    });

    if (existingFriendship) {
      return null;
    }

    return this.friendshipModel.create({
      requesterId,
      addresseeId,
      status: FriendshipStatus.PENDING,
    });
  }

  async acceptFriendRequest(
    friendshipId: string,
    userId: string
  ): Promise<Friendship | null> {
    if (!isValidObjectId(friendshipId)) {
      return null;
    }

    const friendship = await this.friendshipModel.findById(friendshipId);
    if (
      !friendship ||
      friendship.addresseeId !== userId ||
      friendship.status !== FriendshipStatus.PENDING
    ) {
      return null;
    }

    return this.friendshipModel.findByIdAndUpdate(
      friendshipId,
      { status: FriendshipStatus.ACCEPTED },
      { new: true }
    );
  }

  async declineFriendRequest(
    friendshipId: string,
    userId: string
  ): Promise<boolean> {
    if (!isValidObjectId(friendshipId)) {
      return false;
    }

    const friendship = await this.friendshipModel.findById(friendshipId);
    if (
      !friendship ||
      friendship.addresseeId !== userId ||
      friendship.status !== FriendshipStatus.PENDING
    ) {
      return false;
    }

    await this.friendshipModel.findByIdAndDelete(friendshipId);
    return true;
  }

  async blockUser(
    requesterId: string,
    addresseeId: string
  ): Promise<Friendship | null> {
    if (!isValidObjectId(requesterId) || !isValidObjectId(addresseeId)) {
      return null;
    }

    const existingFriendship = await this.friendshipModel.findOne({
      $or: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    });

    if (existingFriendship) {
      return this.friendshipModel.findByIdAndUpdate(
        existingFriendship._id,
        {
          requesterId,
          addresseeId,
          status: FriendshipStatus.BLOCKED,
        },
        { new: true }
      );
    }

    return this.friendshipModel.create({
      requesterId,
      addresseeId,
      status: FriendshipStatus.BLOCKED,
    });
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    if (!isValidObjectId(userId) || !isValidObjectId(friendId)) {
      return false;
    }

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requesterId: userId, addresseeId: friendId },
        { requesterId: friendId, addresseeId: userId },
      ],
      status: FriendshipStatus.ACCEPTED,
    });

    if (!friendship) {
      return false;
    }

    await this.friendshipModel.findByIdAndDelete(friendship._id);
    return true;
  }

  async getFriends(userId: string): Promise<Friend[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    const friendships = await this.friendshipModel
      .find({
        $or: [
          { requesterId: userId, status: FriendshipStatus.ACCEPTED },
          { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
        ],
      })
      .populate("requesterId addresseeId");

    const friends: Friend[] = [];
    for (const friendship of friendships) {
      const friendUser =
        friendship.requesterId === userId
          ? friendship.addresseeId
          : friendship.requesterId;

      if (typeof friendUser === "object" && (friendUser as any)._id) {
        const user = friendUser as any;
        friends.push({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          friendshipId: friendship._id!,
          friendsSince: friendship.createdAt!,
        });
      }
    }

    return friends;
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    const friendships = await this.friendshipModel
      .find({
        addresseeId: userId,
        status: FriendshipStatus.PENDING,
      })
      .populate("requesterId");

    return friendships.map((friendship) => ({
      friendship,
      requester: {
        _id: (friendship.requesterId as any)._id,
        firstName: (friendship.requesterId as any).firstName,
        lastName: (friendship.requesterId as any).lastName,
        email: (friendship.requesterId as any).email,
        avatar: (friendship.requesterId as any).avatar,
      },
    }));
  }

  async getSentRequests(userId: string): Promise<Friendship[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    return this.friendshipModel
      .find({
        requesterId: userId,
        status: FriendshipStatus.PENDING,
      })
      .populate("addresseeId");
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    if (!isValidObjectId(userId1) || !isValidObjectId(userId2)) {
      return false;
    }

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
      status: FriendshipStatus.ACCEPTED,
    });

    return !!friendship;
  }

  async searchUsers(
    query: string,
    currentUserId: string,
    limit: number = 10
  ): Promise<User[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const regex = new RegExp(query, "i");
    return this.userModel
      .find({
        _id: { $ne: currentUserId },
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        isActive: true,
      })
      .select("firstName lastName email avatar")
      .limit(limit);
  }
}
