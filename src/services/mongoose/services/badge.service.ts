import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Badge, BadgeRule, UserBadge, BadgeProgress } from "../../../models";

export type CreateBadge = Omit<Badge, '_id' | 'createdAt' | 'updatedAt'>;

export class BadgeService {
    readonly badgeModel: Model<Badge>;
    readonly userBadgeModel: Model<UserBadge>;

    constructor(public readonly _connection: Mongoose) {
        this.badgeModel = _connection.model<Badge>('Badge');
        this.userBadgeModel = _connection.model<UserBadge>('UserBadge');
    }

    async createBadge(badgeData: CreateBadge): Promise<Badge> {
        return this.badgeModel.create(badgeData);
    }

    async findAllBadges(includeInactive: boolean = false): Promise<Badge[]> {
        const filter = includeInactive ? {} : { isActive: true };
        return this.badgeModel.find(filter).sort({ createdAt: -1 });
    }

    async findBadgeById(badgeId: string): Promise<Badge | null> {
        if (!isValidObjectId(badgeId)) return null;
        return this.badgeModel.findById(badgeId);
    }

    async updateBadge(badgeId: string, updateData: Partial<CreateBadge>): Promise<Badge | null> {
        if (!isValidObjectId(badgeId)) return null;
        return this.badgeModel.findByIdAndUpdate(badgeId, updateData, { new: true });
    }

    async deleteBadge(badgeId: string): Promise<boolean> {
        if (!isValidObjectId(badgeId)) return false;
        const result = await this.badgeModel.findByIdAndDelete(badgeId);
        return !!result;
    }

    async toggleBadgeStatus(badgeId: string): Promise<Badge | null> {
        if (!isValidObjectId(badgeId)) return null;
        const badge = await this.badgeModel.findById(badgeId);
        if (!badge) return null;
        
        return this.badgeModel.findByIdAndUpdate(
            badgeId, 
            { isActive: !badge.isActive }, 
            { new: true }
        );
    }

    async awardBadgeToUser(userId: string, badgeId: string, metadata?: Record<string, any>): Promise<UserBadge | null> {
        if (!isValidObjectId(badgeId) || !isValidObjectId(userId)) return null;

        const existingUserBadge = await this.userBadgeModel.findOne({ userId, badgeId });
        if (existingUserBadge) return existingUserBadge;

        const badge = await this.findBadgeById(badgeId);
        if (!badge || !badge.isActive) return null;

        return this.userBadgeModel.create({
            userId,
            badgeId,
            awardedAt: new Date(),
            progress: 100,
            metadata
        });
    }

    async getUserBadges(userId: string): Promise<UserBadge[]> {
        if (!isValidObjectId(userId)) return [];
        return this.userBadgeModel.find({ userId })
            .populate('badgeId')
            .sort({ awardedAt: -1 });
    }

    async getUserBadgeProgress(userId: string): Promise<BadgeProgress[]> {
        if (!isValidObjectId(userId)) return [];
        
        const allBadges = await this.findAllBadges();
        const userBadges = await this.getUserBadges(userId);
        const userBadgeIds = userBadges.map(ub => ub.badgeId.toString());

        const progress: BadgeProgress[] = [];

        for (const badge of allBadges) {
            const isCompleted = userBadgeIds.includes(badge._id!);
            const currentProgress = isCompleted ? 100 : 0;

            progress.push({
                badgeId: badge._id!,
                badge,
                progress: currentProgress,
                maxProgress: 100,
                isCompleted,
                nextMilestone: isCompleted ? undefined : 100
            });
        }

        return progress;
    }

    async getBadgeLeaderboard(badgeId: string, limit: number = 10): Promise<UserBadge[]> {
        if (!isValidObjectId(badgeId)) return [];
        
        return this.userBadgeModel.find({ badgeId })
            .populate('userId')
            .sort({ awardedAt: 1 })
            .limit(limit);
    }

    async getUserBadgeCount(userId: string): Promise<number> {
        if (!isValidObjectId(userId)) return 0;
        return this.userBadgeModel.countDocuments({ userId });
    }

    async getBadgeStats(): Promise<{
        totalBadges: number;
        activeBadges: number;
        inactiveBadges: number;
        totalAwarded: number;
        mostPopularBadge?: { badge: Badge; count: number };
    }> {
        const [totalBadges, activeBadges, inactiveBadges, totalAwarded] = await Promise.all([
            this.badgeModel.countDocuments(),
            this.badgeModel.countDocuments({ isActive: true }),
            this.badgeModel.countDocuments({ isActive: false }),
            this.userBadgeModel.countDocuments()
        ]);

        const popularBadgeAggregation = await this.userBadgeModel.aggregate([
            { $group: { _id: '$badgeId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        let mostPopularBadge;
        if (popularBadgeAggregation.length > 0) {
            const badge = await this.findBadgeById(popularBadgeAggregation[0]._id);
            if (badge) {
                mostPopularBadge = {
                    badge,
                    count: popularBadgeAggregation[0].count
                };
            }
        }

        return {
            totalBadges,
            activeBadges,
            inactiveBadges,
            totalAwarded,
            mostPopularBadge
        };
    }

    async findBadgesByType(type: string): Promise<Badge[]> {
        return this.badgeModel.find({ type, isActive: true });
    }

    async findBadgesByRarity(rarity: string): Promise<Badge[]> {
        return this.badgeModel.find({ rarity, isActive: true });
    }

    async evaluateBadgeRules(userId: string, badge: Badge, userStats: any): Promise<boolean> {
        if (!badge.rules || badge.rules.length === 0) return false;

        for (const rule of badge.rules) {
            if (!await this.evaluateRule(rule, userStats)) {
                return false;
            }
        }

        return true;
    }

    private async evaluateRule(rule: BadgeRule, userStats: any): Promise<boolean> {
        const { type, operator, value } = rule;
        
        let statValue: number;
        
        switch (type) {
            case 'workout_count':
                statValue = userStats.totalWorkouts || 0;
                break;
            case 'challenge_completed':
                statValue = userStats.challengesCompleted || 0;
                break;
            case 'streak_days':
                statValue = userStats.currentStreak || 0;
                break;
            case 'calories_burned':
                statValue = userStats.totalCaloriesBurned || 0;
                break;
            case 'gym_visits':
                statValue = userStats.gymVisits || 0;
                break;
            default:
                console.warn(`Unknown rule type: ${type}`);
                return false;
        }

        const result = this.compareValues(statValue, operator, value);      
        return result;
    }

    private compareValues(statValue: number, operator: string, targetValue: number | [number, number]): boolean {
        switch (operator) {
            case 'eq':
                return statValue === targetValue;
            case 'gt':
                return statValue > (targetValue as number);
            case 'gte':
                return statValue >= (targetValue as number);
            case 'lt':
                return statValue < (targetValue as number);
            case 'lte':
                return statValue <= (targetValue as number);
            case 'between':
                if (Array.isArray(targetValue)) {
                    return statValue >= targetValue[0] && statValue <= targetValue[1];
                }
                return false;
            default:
                console.warn(`Unknown operator: ${operator}. Use: eq, gt, gte, lt, lte, between`);
                return false;
        }
    }
}
