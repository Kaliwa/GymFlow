import { Timestamps } from "./timestamps";

export enum FriendshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  BLOCKED = "BLOCKED",
}

export interface Friendship extends Timestamps {
  _id?: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
}

export interface FriendRequest {
  friendship: Friendship;
  requester: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export interface Friend {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  friendshipId: string;
  friendsSince: Date;
}
