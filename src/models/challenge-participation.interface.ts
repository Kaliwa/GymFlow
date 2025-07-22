import { Timestamps } from "./timestamps";

export enum ParticipationStatus {
  INVITED = "INVITED",
  JOINED = "JOINED",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
}

export interface ChallengeParticipation extends Timestamps {
  _id?: string;
  challengeId: string;
  userId: string;
  invitedBy?: string;
  status: ParticipationStatus;
  joinedAt?: Date;
  completedAt?: Date;
  progress: number;
  workoutCount: number;
}

export interface ChallengeInvitation {
  _id?: string;
  challengeId: string;
  inviterId: string;
  inviteeId: string;
  message?: string;
  createdAt: Date;
  respondedAt?: Date;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
}

export interface ChallengeStats {
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  averageProgress: number;
  topPerformers: Array<{
    userId: string;
    firstName: string;
    lastName: string;
    progress: number;
    workoutCount: number;
  }>;
}
