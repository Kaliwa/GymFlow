import { Types } from "mongoose";
import { Timestamps } from "./timestamps";
import { Gym } from "./gym.interface";
import { User } from "./user.interface";
import { Equipment } from "./equipment.interface";
import { Exercise } from "./exercise.interface";

export enum ChallengeType {
  INDIVIDUAL = "INDIVIDUAL",
  TEAM = "TEAM",
  OPEN = "OPEN",
}

export interface Challenge extends Timestamps {
  _id?: string;
  title: string;
  description: string;
  gym: string | Gym;
  createdBy: string | User;
  equipments?: string[] | Equipment[];
  exercises?: string[] | Exercise[];
  difficulty?: "easy" | "medium" | "hard";
  type: ChallengeType;
  maxParticipants?: number;
  isPrivate: boolean;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  requiresInvitation: boolean;
}
