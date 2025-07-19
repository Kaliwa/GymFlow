import { Schema } from "mongoose";
import { WorkoutSession, WorkoutType } from "../../../models/workout.interface";

export function workoutSessionSchema(): Schema<WorkoutSession> {
    return new Schema<WorkoutSession>({
        userId: { 
            type: String, 
            ref: 'User', 
            required: true 
        },
        gymId: { 
            type: String, 
            ref: 'Gym', 
            required: false 
        },
        challengeId: { 
            type: String, 
            ref: 'Challenge', 
            required: false 
        },
        name: { 
            type: String, 
            required: true 
        },
        type: { 
            type: String, 
            enum: Object.values(WorkoutType), 
            required: true 
        },
        duration: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        caloriesBurned: { 
            type: Number, 
            required: false, 
            min: 0 
        },
        exercises: [{
            exerciseId: { 
                type: String, 
                ref: 'Exercise', 
                required: true 
            },
            sets: [{
                reps: { type: Number, min: 0 },
                weight: { type: Number, min: 0 },
                duration: { type: Number, min: 0 },
                distance: { type: Number, min: 0 },
                restTime: { type: Number, min: 0 }
            }],
            notes: { type: String }
        }],
        notes: { type: String },
        startedAt: { 
            type: Date, 
            required: true 
        },
        completedAt: { 
            type: Date, 
            required: false 
        },
        isCompleted: { 
            type: Boolean, 
            required: true, 
            default: false 
        }
    }, {
        timestamps: true,
        collection: "workout_sessions",
        versionKey: false,
    });
}
