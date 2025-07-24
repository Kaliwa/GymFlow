import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Challenge } from "../../../models/challenge.interface";

export type CreateChallenge = Omit<Challenge, '_id' | 'createdAt' | 'updatedAt'>

export class ChallengeService {
  readonly challengeModel: Model<Challenge>;

  constructor(public readonly _connection: Mongoose) {
    this.challengeModel = _connection.model<Challenge>("Challenge");
  }
    async createChallenge(challengeData: CreateChallenge): Promise<Challenge> {
        return this.challengeModel.create(challengeData);
    }

    async findByIdWithPopulate(id: string): Promise<Challenge | null> {
        if (!isValidObjectId(id)) return null;
        return this.challengeModel.findById(id)
            .populate('gym')
            .populate('equipments')
            .populate('exercises');
    }

    async findAllChallenges(): Promise<Challenge[]> {
        return this.challengeModel.find()
            .populate('gym')
            .populate('equipments')
            .populate('exercises');
    }

    async updateChallenge(id: string, updateData: Partial<CreateChallenge>): Promise<Challenge | null> {
        if (!isValidObjectId(id)) return null;
        return this.challengeModel.findByIdAndUpdate(id, updateData, { new: true })
            .populate('gym')
            .populate('equipments')
            .populate('exercises');
    }
    async deleteChallenge(id: string): Promise<boolean> {
        if (!isValidObjectId(id)) return false;
        const result = await this.challengeModel.findByIdAndDelete(id);
        return !!result;
    }

    async findByGymWithPopulate(gymId: string): Promise<Challenge[]> {
        if (!isValidObjectId(gymId)) return [];
        return this.challengeModel.find({ gym: gymId })
            .populate('gym')
            .populate('equipments')
            .populate('exercises');
    }

    async findById(id: string): Promise<Challenge | null> {
        if (!isValidObjectId(id)) return null;
        return this.challengeModel.findById(id);
    }

  async getUserChallengeCounts() {
    if (!this.challengeModel.collection.collectionName.includes('user_challenge')) return [];
    return this.challengeModel.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $project: { userId: "$_id", count: 1, _id: 0 } }
    ]);
  }
}
