import { Mongoose, Model, isValidObjectId } from "mongoose";
import {
  ChallengeParticipation,
  ChallengeInvitation,
  ParticipationStatus,
  ChallengeStats,
  User,
  Challenge,
} from "../../../models";

export class ChallengeParticipationService {
  readonly participationModel: Model<ChallengeParticipation>;
  readonly invitationModel: Model<ChallengeInvitation>;
  readonly userModel: Model<User>;
  readonly challengeModel: Model<Challenge>;

  constructor(public readonly _connection: Mongoose) {
    this.participationModel = _connection.model<ChallengeParticipation>(
      "ChallengeParticipation"
    );
    this.invitationModel = _connection.model<ChallengeInvitation>(
      "ChallengeInvitation"
    );
    this.userModel = _connection.model<User>("User");
    this.challengeModel = _connection.model<Challenge>("Challenge");
  }

  async inviteToChallenge(
    challengeId: string,
    inviterId: string,
    inviteeId: string,
    message?: string
  ): Promise<ChallengeInvitation | null> {
    if (
      !isValidObjectId(challengeId) ||
      !isValidObjectId(inviterId) ||
      !isValidObjectId(inviteeId)
    ) {
      return null;
    }

    if (inviterId === inviteeId) {
      return null;
    }

    const existingInvitation = await this.invitationModel.findOne({
      challengeId,
      inviteeId,
      status: "PENDING",
    });

    if (existingInvitation) {
      return null;
    }

    const existingParticipation = await this.participationModel.findOne({
      challengeId,
      userId: inviteeId,
    });

    if (existingParticipation) {
      return null;
    }

    return this.invitationModel.create({
      challengeId,
      inviterId,
      inviteeId,
      message,
      status: "PENDING",
    });
  }

  async acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<ChallengeParticipation | null> {
    if (!isValidObjectId(invitationId)) {
      return null;
    }

    const invitation = await this.invitationModel.findById(invitationId);
    if (
      !invitation ||
      invitation.inviteeId !== userId ||
      invitation.status !== "PENDING"
    ) {
      return null;
    }

    await this.invitationModel.findByIdAndUpdate(invitationId, {
      status: "ACCEPTED",
      respondedAt: new Date(),
    });

    return this.joinChallenge(
      invitation.challengeId,
      userId,
      invitation.inviterId
    );
  }

  async declineInvitation(
    invitationId: string,
    userId: string
  ): Promise<boolean> {
    if (!isValidObjectId(invitationId)) {
      return false;
    }

    const invitation = await this.invitationModel.findById(invitationId);
    if (
      !invitation ||
      invitation.inviteeId !== userId ||
      invitation.status !== "PENDING"
    ) {
      return false;
    }

    await this.invitationModel.findByIdAndUpdate(invitationId, {
      status: "DECLINED",
      respondedAt: new Date(),
    });

    return true;
  }

  async joinChallenge(
    challengeId: string,
    userId: string,
    invitedBy?: string
  ): Promise<ChallengeParticipation | null> {
    if (!isValidObjectId(challengeId) || !isValidObjectId(userId)) {
      return null;
    }

    const existingParticipation = await this.participationModel.findOne({
      challengeId,
      userId,
    });

    if (existingParticipation) {
      if (existingParticipation.status === ParticipationStatus.INVITED) {
        return this.participationModel.findByIdAndUpdate(
          existingParticipation._id,
          {
            status: ParticipationStatus.JOINED,
            joinedAt: new Date(),
          },
          { new: true }
        );
      }
      return null;
    }

    return this.participationModel.create({
      challengeId,
      userId,
      invitedBy,
      status: ParticipationStatus.JOINED,
      joinedAt: new Date(),
      progress: 0,
      workoutCount: 0,
    });
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<boolean> {
    if (!isValidObjectId(challengeId) || !isValidObjectId(userId)) {
      return false;
    }

    const participation = await this.participationModel.findOne({
      challengeId,
      userId,
      status: {
        $in: [ParticipationStatus.JOINED, ParticipationStatus.INVITED],
      },
    });

    if (!participation) {
      return false;
    }

    await this.participationModel.findByIdAndUpdate(participation._id, {
      status: ParticipationStatus.ABANDONED,
    });

    return true;
  }

  async updateProgress(
    challengeId: string,
    userId: string,
    progress: number,
    workoutCount?: number
  ): Promise<ChallengeParticipation | null> {
    if (!isValidObjectId(challengeId) || !isValidObjectId(userId)) {
      return null;
    }

    const updateData: any = { progress: Math.min(100, Math.max(0, progress)) };
    if (workoutCount !== undefined) {
      updateData.workoutCount = workoutCount;
    }

    if (progress >= 100) {
      updateData.status = ParticipationStatus.COMPLETED;
      updateData.completedAt = new Date();
    }

    return this.participationModel.findOneAndUpdate(
      {
        challengeId,
        userId,
        status: {
          $in: [ParticipationStatus.JOINED, ParticipationStatus.INVITED],
        },
      },
      updateData,
      { new: true }
    );
  }

  async getChallengeParticipants(
    challengeId: string
  ): Promise<ChallengeParticipation[]> {
    if (!isValidObjectId(challengeId)) {
      return [];
    }

    return this.participationModel
      .find({
        challengeId,
        status: { $ne: ParticipationStatus.ABANDONED },
      })
      .populate("userId", "firstName lastName email avatar");
  }

  async getUserParticipations(
    userId: string
  ): Promise<ChallengeParticipation[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    return this.participationModel
      .find({
        userId,
        status: { $ne: ParticipationStatus.ABANDONED },
      })
      .populate("challengeId");
  }

  async getUserInvitations(userId: string): Promise<ChallengeInvitation[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    return this.invitationModel
      .find({
        inviteeId: userId,
        status: "PENDING",
      })
      .populate(
        "challengeId inviterId",
        "title description firstName lastName"
      );
  }

  async getChallengeStats(challengeId: string): Promise<ChallengeStats | null> {
    if (!isValidObjectId(challengeId)) {
      return null;
    }

    const participations = await this.participationModel
      .find({
        challengeId,
        status: { $ne: ParticipationStatus.ABANDONED },
      })
      .populate("userId", "firstName lastName");

    const totalParticipants = participations.length;
    const activeParticipants = participations.filter(
      (p) => p.status === ParticipationStatus.JOINED
    ).length;
    const completedParticipants = participations.filter(
      (p) => p.status === ParticipationStatus.COMPLETED
    ).length;
    const averageProgress =
      totalParticipants > 0
        ? participations.reduce((sum, p) => sum + p.progress, 0) /
          totalParticipants
        : 0;

    const topPerformers = participations
      .sort(
        (a, b) => b.progress - a.progress || b.workoutCount - a.workoutCount
      )
      .slice(0, 10)
      .map((p) => ({
        userId: (p.userId as any)._id,
        firstName: (p.userId as any).firstName,
        lastName: (p.userId as any).lastName,
        progress: p.progress,
        workoutCount: p.workoutCount,
      }));

    return {
      totalParticipants,
      activeParticipants,
      completedParticipants,
      averageProgress,
      topPerformers,
    };
  }

  async isUserParticipating(
    challengeId: string,
    userId: string
  ): Promise<boolean> {
    if (!isValidObjectId(challengeId) || !isValidObjectId(userId)) {
      return false;
    }

    const participation = await this.participationModel.findOne({
      challengeId,
      userId,
      status: {
        $in: [ParticipationStatus.JOINED, ParticipationStatus.COMPLETED],
      },
    });

    return !!participation;
  }
}
