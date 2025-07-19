import { ExerciseService } from "../services/mongoose/services";
import { Exercise, Equipment } from "../models";

export async function seedExercises(exerciseService: ExerciseService, equipments: Equipment[]): Promise<Exercise[]> {
    const exercisesData: Partial<Exercise>[] = [
        {
            name: 'Développé Couché',
            description: 'Exercice de base pour les pectoraux, épaules et triceps',
            targetMuscles: ['Pectoraux', 'Triceps', 'Deltoïdes antérieurs'],
            equipments: [equipments.find(e => e.name === 'Banc de Musculation Multifonctions')?._id || ''].filter(Boolean),
            type: 'strength',
            level: 'intermediate',
            isPublic: true
        },
        {
            name: 'Squat',
            description: 'Exercice fondamental pour les jambes et les fessiers',
            targetMuscles: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
            equipments: [equipments.find(e => e.name === 'Rack de Squat Olympique')?._id || ''].filter(Boolean),
            type: 'strength',
            level: 'intermediate',
            isPublic: true
        },
        {
            name: 'Course sur Tapis',
            description: 'Exercice cardiovasculaire pour améliorer l\'endurance',
            targetMuscles: ['Quadriceps', 'Mollets', 'Système cardiovasculaire'],
            equipments: [equipments.find(e => e.name === 'Tapis de Course Premium')?._id || ''].filter(Boolean),
            type: 'cardio',
            level: 'beginner',
            isPublic: true
        },
        {
            name: 'Rowing',
            description: 'Exercice complet pour le dos et les bras',
            targetMuscles: ['Grand dorsal', 'Biceps', 'Rhomboïdes'],
            equipments: [equipments.find(e => e.name === 'Rameur Concept2')?._id || ''].filter(Boolean),
            type: 'cardio',
            level: 'intermediate',
            isPublic: true
        },
        {
            name: 'Kettlebell Swing',
            description: 'Exercice fonctionnel pour tout le corps',
            targetMuscles: ['Fessiers', 'Ischio-jambiers', 'Core', 'Épaules'],
            equipments: [equipments.find(e => e.name === 'Kettlebells Set Complet')?._id || ''].filter(Boolean),
            type: 'strength',
            level: 'intermediate',
            isPublic: true
        },
        {
            name: 'Box Jump',
            description: 'Exercice pliométrique pour la puissance des jambes',
            targetMuscles: ['Quadriceps', 'Fessiers', 'Mollets'],
            equipments: [equipments.find(e => e.name === 'Box de CrossFit Pliométrique')?._id || ''].filter(Boolean),
            type: 'cardio',
            level: 'advanced',
            isPublic: true
        },
        {
            name: 'Vélo Elliptique',
            description: 'Exercice cardio à faible impact',
            targetMuscles: ['Quadriceps', 'Fessiers', 'Système cardiovasculaire'],
            equipments: [equipments.find(e => e.name === 'Vélo Elliptique Premium')?._id || ''].filter(Boolean),
            type: 'cardio',
            level: 'beginner',
            isPublic: true
        },
        {
            name: 'Yoga Flow',
            description: 'Enchaînement de postures de yoga pour la flexibilité',
            targetMuscles: ['Corps entier', 'Flexibilité', 'Équilibre'],
            equipments: [equipments.find(e => e.name === 'Tapis de Yoga Premium')?._id || ''].filter(Boolean),
            type: 'flexibility',
            level: 'beginner',
            isPublic: true
        },
        {
            name: 'Curl Biceps',
            description: 'Exercice d\'isolation pour les biceps',
            targetMuscles: ['Biceps', 'Avant-bras'],
            equipments: [equipments.find(e => e.name === 'Haltères Ajustables')?._id || ''].filter(Boolean),
            type: 'strength',
            level: 'beginner',
            isPublic: true
        },
        {
            name: 'TRX Rows',
            description: 'Exercice de tirage pour le dos avec TRX',
            targetMuscles: ['Grand dorsal', 'Rhomboïdes', 'Biceps'],
            equipments: [equipments.find(e => e.name === 'TRX Suspension Trainer')?._id || ''].filter(Boolean),
            type: 'strength',
            level: 'intermediate',
            isPublic: true
        }
    ];

    const createdExercises: Exercise[] = [];

    for (const exerciseData of exercisesData) {
        try {
            const allExercises = await exerciseService.findAll();
            const existingExercise = allExercises.find((e: Exercise) => 
                e.name === exerciseData.name
            );
            
            if (!existingExercise) {
                const exercise = await exerciseService.create(exerciseData);
                createdExercises.push(exercise);
            } else {
                createdExercises.push(existingExercise);
            }
        } catch (error) {
            // Ignore errors silently
        }
    }

    return createdExercises;
}
