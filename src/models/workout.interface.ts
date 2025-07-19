import { Timestamps } from "./timestamps";

export enum WorkoutType {
    STRENGTH = 'STRENGTH',
    CARDIO = 'CARDIO',
    FLEXIBILITY = 'FLEXIBILITY',
    BALANCE = 'BALANCE',
    MIXED = 'MIXED'
}

export interface WorkoutSession extends Timestamps {
    _id?: string;
    userId: string;
    gymId?: string;
    challengeId?: string;
    name: string;
    type: WorkoutType;
    duration: number;
    caloriesBurned?: number;
    exercises: WorkoutExercise[];
    notes?: string;
    startedAt: Date;
    completedAt?: Date;
    isCompleted: boolean;
}

export interface WorkoutExercise {
    exerciseId: string;
    sets: ExerciseSet[];
    notes?: string;
}

export interface ExerciseSet {
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    restTime?: number;
}

export interface UserProgress extends Timestamps {
    _id?: string;
    userId: string;
    totalWorkouts: number;
    totalCaloriesBurned: number;
    totalWorkoutTime: number;
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate?: Date;
    weeklyGoal?: number;
    monthlyGoal?: number;
    achievementPoints: number;
    level: number;
    experiencePoints: number;
}

export interface UserStats {
    totalWorkouts: number;
    totalCaloriesBurned: number;
    totalWorkoutTime: number;
    currentStreak: number;
    longestStreak: number;
    averageWorkoutDuration: number;
    workoutsThisWeek: number;
    workoutsThisMonth: number;
    favoriteWorkoutType: WorkoutType;
    totalBadges: number;
    achievementPoints: number;
    level: number;
    experiencePoints: number;
}
