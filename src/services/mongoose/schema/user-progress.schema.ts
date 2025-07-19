import { Schema } from "mongoose";
import { UserProgress } from "../../../models/workout.interface";

export function userProgressSchema(): Schema<UserProgress> {
    return new Schema<UserProgress>({
        userId: { 
            type: String, 
            ref: 'User', 
            required: true, 
            unique: true 
        },
        totalWorkouts: { 
            type: Number, 
            required: true, 
            default: 0, 
            min: 0 
        },
        totalCaloriesBurned: { 
            type: Number, 
            required: true, 
            default: 0, 
            min: 0 
        },
        totalWorkoutTime: { 
            type: Number, 
            required: true, 
            default: 0, 
            min: 0 
        },
        currentStreak: { 
            type: Number, 
            required: true, 
            default: 0, 
            min: 0 
        },
        longestStreak: { 
            type: Number, 
            required: true, 
            default: 0, 
            min: 0 
        },
        lastWorkoutDate: { 
            type: Date, 
            required: false 
        },
        weeklyGoal: { 
            type: Number, 
            required: false, 
            min: 0 
        },
        monthlyGoal: { 
            type: Number, 
            required: false, 
            min: 0 
        },
        achievementPoints: { 
            type: Number, 
            required: true, 
            default: 0, 
            min: 0 
        },
        level: { 
            type: Number, 
            required: true, 
            default: 1, 
            min: 1 
        },
        experiencePoints: { 
            type: Number, 
            required: true, 
            default: 0, 
            min: 0 
        }
    }, {
        timestamps: true,
        collection: "user_progress",
        versionKey: false,
    });
}
