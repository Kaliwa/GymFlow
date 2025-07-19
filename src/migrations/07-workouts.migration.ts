import { WorkoutService } from "../services/mongoose/services";
import { WorkoutSession, User, Exercise, Gym, Challenge, WorkoutType } from "../models";

export async function seedWorkouts(
    workoutService: WorkoutService, 
    users: User[], 
    exercises: Exercise[], 
    gyms: Gym[], 
    challenges: Challenge[]
): Promise<WorkoutSession[]> {
    if (exercises.length === 0) {
        return [];
    }

    
    const workoutsData = [
        {
            userId: users[3]?._id || '',
            name: 'Morning Cardio Session',
            type: WorkoutType.CARDIO,
            duration: 45,
            exercises: [
                {
                    exerciseId: exercises.find(e => e.name === 'Course sur Tapis')?._id?.toString() || '',
                    sets: [
                        { duration: 20, distance: 5000, notes: 'Rythme modéré' },
                        { duration: 15, distance: 3000, notes: 'Sprint intervals' },
                        { duration: 10, distance: 2000, notes: 'Cool down' }
                    ]
                },
                {
                    exerciseId: exercises.find(e => e.name === 'Vélo Elliptique')?._id?.toString() || '',
                    sets: [
                        { duration: 20, notes: 'Résistance moyenne' }
                    ]
                }
            ],
            gymId: gyms[0]?._id || '',
            caloriesBurned: 350,
            notes: 'Excellente session de cardio matinale!',
            startedAt: new Date('2024-12-15T07:00:00Z'),
            isCompleted: true
        },
        {
            userId: users[4]?._id || '',
            name: 'Strength Training',
            type: WorkoutType.STRENGTH,
            duration: 60,
            exercises: [
                {
                    exerciseId: exercises.find(e => e.name === 'Développé Couché')?._id?.toString() || '',
                    sets: [
                        { reps: 10, weight: 60, restTime: 90 },
                        { reps: 8, weight: 70, restTime: 90 },
                        { reps: 6, weight: 80, restTime: 120 },
                        { reps: 4, weight: 90, restTime: 120 }
                    ]
                },
                {
                    exerciseId: exercises.find(e => e.name === 'Squat')?._id?.toString() || '',
                    sets: [
                        { reps: 12, weight: 80, restTime: 90 },
                        { reps: 10, weight: 90, restTime: 90 },
                        { reps: 8, weight: 100, restTime: 120 }
                    ]
                }
            ],
            gymId: gyms[1]?._id || '',
            caloriesBurned: 420,
            notes: 'Progression sur le développé couché!',
            startedAt: new Date('2024-12-14T18:00:00Z'),
            isCompleted: true
        },
        {
            userId: users[5]?._id || '',
            name: 'CrossFit WOD',
            type: WorkoutType.MIXED,
            duration: 50,
            exercises: [
                {
                    exerciseId: exercises.find(e => e.name === 'Kettlebell Swing')?._id?.toString() || '',
                    sets: [
                        { reps: 50, weight: 16, notes: 'EMOM 5 rounds' }
                    ]
                },
                {
                    exerciseId: exercises.find(e => e.name === 'Box Jump')?._id?.toString() || '',
                    sets: [
                        { reps: 30, notes: '20 inch box' }
                    ]
                }
            ],
            gymId: gyms[2]?._id || '',
            challengeId: challenges.find(c => c.title?.includes('CrossFit'))?._id || '',
            caloriesBurned: 480,
            notes: 'WOD intense! Nouveau PR sur les box jumps',
            startedAt: new Date('2024-12-13T19:00:00Z'),
            isCompleted: true
        },
        {
            userId: users[3]?._id || '',
            name: 'Zen Yoga Flow',
            type: WorkoutType.FLEXIBILITY,
            duration: 60,
            exercises: [
                {
                    exerciseId: exercises.find(e => e.name === 'Yoga Flow')?._id?.toString() || '',
                    sets: [
                        { duration: 60, notes: 'Sun salutation + warrior poses + relaxation' }
                    ]
                }
            ],
            gymId: gyms[3]?._id || '',
            challengeId: challenges.find(c => c.title?.includes('Yoga'))?._id || '',
            caloriesBurned: 180,
            notes: 'Session très relaxante, parfaite pour finir la journée',
            startedAt: new Date('2024-12-12T20:00:00Z'),
            isCompleted: true
        },
        {
            userId: users[4]?._id || '',
            name: 'Full Body Workout',
            type: WorkoutType.STRENGTH,
            duration: 75,
            exercises: [
                {
                    exerciseId: exercises.find(e => e.name === 'Squat')?._id?.toString() || '',
                    sets: [
                        { reps: 15, weight: 70 },
                        { reps: 12, weight: 80 },
                        { reps: 10, weight: 90 }
                    ]
                },
                {
                    exerciseId: exercises.find(e => e.name === 'TRX Rows')?._id?.toString() || '',
                    sets: [
                        { reps: 15 },
                        { reps: 12 },
                        { reps: 10 }
                    ]
                },
                {
                    exerciseId: exercises.find(e => e.name === 'Curl Biceps')?._id?.toString() || '',
                    sets: [
                        { reps: 12, weight: 12 },
                        { reps: 10, weight: 14 },
                        { reps: 8, weight: 16 }
                    ]
                }
            ],
            gymId: gyms[0]?._id || '',
            caloriesBurned: 520,
            notes: 'Workout complet très satisfaisant',
            startedAt: new Date('2024-12-11T17:30:00Z'),
            isCompleted: true
        },
        {
            userId: users[5]?._id || '',
            name: 'Cardio HIIT',
            type: WorkoutType.CARDIO,
            duration: 30,
            exercises: [
                {
                    exerciseId: exercises.find(e => e.name === 'Course sur Tapis')?._id?.toString() || '',
                    sets: [
                        { duration: 2, notes: 'Sprint 15km/h' },
                        { duration: 1, notes: 'Recovery 8km/h' },
                        { duration: 2, notes: 'Sprint 16km/h' },
                        { duration: 1, notes: 'Recovery 8km/h' },
                        { duration: 2, notes: 'Sprint 17km/h' },
                        { duration: 1, notes: 'Recovery 8km/h' }
                    ]
                },
                {
                    exerciseId: exercises.find(e => e.name === 'Rowing')?._id?.toString() || '',
                    sets: [
                        { duration: 10, notes: 'High intensity intervals' }
                    ]
                }
            ],
            gymId: gyms[0]?._id || '',
            caloriesBurned: 380,
            notes: 'HIIT très intense, excellent pour le cardio!',
            startedAt: new Date('2024-12-10T12:00:00Z'),
            isCompleted: true
        },
        {
            userId: users[3]?._id || '',
            name: 'Evening Strength',
            type: WorkoutType.STRENGTH,
            duration: 45,
            exercises: [
                {
                    exerciseId: exercises.find(e => e.name === 'Développé Couché')?._id?.toString() || '',
                    sets: [
                        { reps: 10, weight: 50 }
                    ]
                }
            ],
            gymId: gyms[0]?._id || '',
            notes: 'Workout en cours...',
            startedAt: new Date(),
            isCompleted: false
        }
    ];

    const createdWorkouts: WorkoutSession[] = [];

    for (const workoutData of workoutsData) {
        try {
            const validExercises = workoutData.exercises.filter(ex => ex.exerciseId && ex.exerciseId !== '');
            
            if (validExercises.length === 0) {
                console.warn(`  ⚠️ Aucun exercice valide trouvé pour ${workoutData.name}, skipping...`);
                continue;
            }
            
            const filteredWorkoutData = {
                ...workoutData,
                exercises: validExercises
            };
            
            const workout = await workoutService.createWorkoutSession(filteredWorkoutData);
            createdWorkouts.push(workout);

            if (workout.isCompleted && workout._id) {
                await workoutService.completeWorkout(workout._id);
            }
            
        } catch (error) {
            console.error(`  ❌ Erreur création workout ${workoutData.name}:`, error);
        }
    }

    return createdWorkouts;
}
