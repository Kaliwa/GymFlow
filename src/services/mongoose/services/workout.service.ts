import { Mongoose, Model, isValidObjectId } from "mongoose";
import { WorkoutSession, UserProgress, UserStats, WorkoutType } from "../../../models";

export type CreateWorkoutSession = Omit<WorkoutSession, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateUserProgress = Omit<UserProgress, '_id' | 'createdAt' | 'updatedAt'>;

export class WorkoutService {
    readonly workoutSessionModel: Model<WorkoutSession>;
    readonly userProgressModel: Model<UserProgress>;

    constructor(public readonly _connection: Mongoose) {
        this.workoutSessionModel = _connection.model<WorkoutSession>('WorkoutSession');
        this.userProgressModel = _connection.model<UserProgress>('UserProgress');
    }

    async createWorkoutSession(workoutData: CreateWorkoutSession): Promise<WorkoutSession> {
        const session = await this.workoutSessionModel.create(workoutData);
        
        await this.updateUserProgress(workoutData.userId, session);
        
        return session;
    }

    async findWorkoutById(workoutId: string): Promise<WorkoutSession | null> {
        if (!isValidObjectId(workoutId)) return null;
        return this.workoutSessionModel.findById(workoutId)
            .populate('gymId')
            .populate('challengeId')
            .populate('exercises.exerciseId');
    }

    async findUserWorkouts(userId: string, limit: number = 20): Promise<WorkoutSession[]> {
        if (!isValidObjectId(userId)) return [];
        return this.workoutSessionModel.find({ userId })
            .populate('gymId')
            .populate('challengeId')
            .populate('exercises.exerciseId')
            .sort({ startedAt: -1 })
            .limit(limit);
    }

    async completeWorkout(workoutId: string): Promise<WorkoutSession | null> {
        if (!isValidObjectId(workoutId)) return null;
        
        const workout = await this.workoutSessionModel.findByIdAndUpdate(
            workoutId,
            { 
                isCompleted: true, 
                completedAt: new Date() 
            },
            { new: true }
        );

        if (workout && !workout.isCompleted) {
            await this.updateUserProgress(workout.userId, workout);
        }

        return workout;
    }

    async updateWorkout(workoutId: string, updateData: Partial<CreateWorkoutSession>): Promise<WorkoutSession | null> {
        if (!isValidObjectId(workoutId)) return null;
        return this.workoutSessionModel.findByIdAndUpdate(workoutId, updateData, { new: true });
    }

    async deleteWorkout(workoutId: string): Promise<boolean> {
        if (!isValidObjectId(workoutId)) return false;
        const result = await this.workoutSessionModel.findByIdAndDelete(workoutId);
        return !!result;
    }

    async getUserProgress(userId: string): Promise<UserProgress | null> {
        if (!isValidObjectId(userId)) return null;
        let progress = await this.userProgressModel.findOne({ userId });
        
        if (!progress) {
            progress = await this.userProgressModel.create({
                userId,
                totalWorkouts: 0,
                totalCaloriesBurned: 0,
                totalWorkoutTime: 0,
                currentStreak: 0,
                longestStreak: 0,
                achievementPoints: 0,
                level: 1,
                experiencePoints: 0
            });
        }
        
        return progress;
    }

    async updateUserProgress(userId: string, completedWorkout: WorkoutSession): Promise<UserProgress | null> {
        if (!isValidObjectId(userId)) return null;

        let progress = await this.getUserProgress(userId);
        if (!progress) return null;

        const today = new Date();
        const lastWorkoutDate = progress.lastWorkoutDate;
        const isConsecutiveDay = lastWorkoutDate && 
            this.isSameDay(today, new Date(lastWorkoutDate.getTime() + 24 * 60 * 60 * 1000));

        let newStreak = progress.currentStreak;
        if (!lastWorkoutDate || this.isSameDay(today, lastWorkoutDate)) {
            newStreak = lastWorkoutDate ? progress.currentStreak : 1;
        } else if (isConsecutiveDay) {
            newStreak = progress.currentStreak + 1;
        } else {
            newStreak = 1;
        }

        const baseXP = 10;
        const durationBonus = Math.floor(completedWorkout.duration / 10);
        const caloriesBonus = completedWorkout.caloriesBurned ? Math.floor(completedWorkout.caloriesBurned / 50) : 0;
        const newXP = baseXP + durationBonus + caloriesBonus;

        const updatedProgress = await this.userProgressModel.findOneAndUpdate(
            { userId },
            {
                $inc: {
                    totalWorkouts: 1,
                    totalCaloriesBurned: completedWorkout.caloriesBurned || 0,
                    totalWorkoutTime: completedWorkout.duration,
                    experiencePoints: newXP
                },
                $set: {
                    currentStreak: newStreak,
                    longestStreak: Math.max(newStreak, progress.longestStreak),
                    lastWorkoutDate: today,
                    level: this.calculateLevel(progress.experiencePoints + newXP)
                }
            },
            { new: true }
        );

        return updatedProgress;
    }

    async getUserStats(userId: string): Promise<UserStats | null> {
        if (!isValidObjectId(userId)) return null;

        const progress = await this.getUserProgress(userId);
        if (!progress) return null;

        const workouts = await this.findUserWorkouts(userId, 1000);
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const workoutsThisWeek = workouts.filter(w => new Date(w.startedAt) >= weekAgo).length;
        const workoutsThisMonth = workouts.filter(w => new Date(w.startedAt) >= monthAgo).length;

        const typeCount: Record<WorkoutType, number> = {
            [WorkoutType.STRENGTH]: 0,
            [WorkoutType.CARDIO]: 0,
            [WorkoutType.FLEXIBILITY]: 0,
            [WorkoutType.BALANCE]: 0,
            [WorkoutType.MIXED]: 0
        };

        workouts.forEach(workout => {
            typeCount[workout.type]++;
        });

        const favoriteWorkoutType = Object.entries(typeCount).reduce((a, b) => 
            typeCount[a[0] as WorkoutType] > typeCount[b[0] as WorkoutType] ? a : b
        )[0] as WorkoutType;

        return {
            totalWorkouts: progress.totalWorkouts,
            totalCaloriesBurned: progress.totalCaloriesBurned,
            totalWorkoutTime: progress.totalWorkoutTime,
            currentStreak: progress.currentStreak,
            longestStreak: progress.longestStreak,
            averageWorkoutDuration: progress.totalWorkouts > 0 ? progress.totalWorkoutTime / progress.totalWorkouts : 0,
            workoutsThisWeek,
            workoutsThisMonth,
            favoriteWorkoutType,
            totalBadges: 0,
            achievementPoints: progress.achievementPoints,
            level: progress.level,
            experiencePoints: progress.experiencePoints
        };
    }

    async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
        if (!isValidObjectId(userId)) return [];
        
        return this.workoutSessionModel.find({
            userId,
            startedAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ startedAt: -1 });
    }

    async getWorkoutsByGym(gymId: string, limit: number = 20): Promise<WorkoutSession[]> {
        if (!isValidObjectId(gymId)) return [];
        
        return this.workoutSessionModel.find({ gymId })
            .populate('userId')
            .sort({ startedAt: -1 })
            .limit(limit);
    }

    async getWorkoutsByChallenge(challengeId: string): Promise<WorkoutSession[]> {
        if (!isValidObjectId(challengeId)) return [];
        
        return this.workoutSessionModel.find({ challengeId })
            .populate('userId')
            .sort({ startedAt: -1 });
    }

    private calculateLevel(experiencePoints: number): number {
        return Math.max(1, Math.floor(Math.sqrt(experiencePoints) / 10));
    }

    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}
