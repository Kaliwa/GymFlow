import { EquipmentService } from "../services/mongoose/services";
import { Equipment, Gym } from "../models";

export async function seedEquipments(equipmentService: EquipmentService, gyms: Gym[]): Promise<Equipment[]> {
    const equipmentsData = [
        {
            name: 'Tapis de Course Premium',
            description: 'Tapis de course professionnel avec écran tactile'
        },
        {
            name: 'Banc de Musculation Multifonctions',
            description: 'Banc de musculation ajustable avec multiples positions'
        },
        {
            name: 'Rameur Concept2',
            description: 'Rameur professionnel avec moniteur de performance'
        },
        {
            name: 'Rack de Squat Olympique',
            description: 'Rack professionnel pour squats et développés'
        },
        {
            name: 'Barre Olympique 20kg',
            description: 'Barre olympique professionnelle 20kg'
        },
        {
            name: 'Plaques Olympiques Set',
            description: 'Set complet de plaques olympiques (2.5kg à 25kg)'
        },
        {
            name: 'Box de CrossFit Pliométrique',
            description: 'Box en bois pour exercices pliométriques'
        },
        {
            name: 'Kettlebells Set Complet',
            description: 'Set de kettlebells de 8kg à 32kg'
        },
        {
            name: 'Vélo Elliptique Premium',
            description: 'Vélo elliptique silencieux avec programmes intégrés'
        },
        {
            name: 'Tapis de Yoga Premium',
            description: 'Tapis de yoga antidérapants haute qualité'
        },
        {
            name: 'Haltères Ajustables',
            description: 'Set d\'haltères ajustables de 5kg à 50kg'
        },
        {
            name: 'Machine à Câbles',
            description: 'Machine multifonctions à câbles pour tous exercices'
        },
        {
            name: 'Swiss Ball',
            description: 'Ballon de gymnastique pour exercices de stabilité'
        },
        {
            name: 'TRX Suspension Trainer',
            description: 'Système d\'entraînement en suspension'
        },
        {
            name: 'Corde à Sauter Pro',
            description: 'Corde à sauter professionnelle avec compteur'
        }
    ];

    const createdEquipments: Equipment[] = [];

    for (const equipmentData of equipmentsData) {
        try {
            const allEquipments = await equipmentService.findAll();
            const existingEquipment = allEquipments.find((e: Equipment) => 
                e.name === equipmentData.name
            );
            
            if (!existingEquipment) {
                const equipment = await equipmentService.create(equipmentData);
                createdEquipments.push(equipment);
            } else {
                createdEquipments.push(existingEquipment);
            }
        } catch (error) {
            // Ignore errors silently
        }
    }

    return createdEquipments;
}
