import { GymService } from "../services/mongoose/services";
import { Gym, GymStatus } from "../models";

export async function seedGyms(gymService: GymService, ownerId: string): Promise<Gym[]> {
    const gymsData = [
        {
            name: 'FitnessPro Center',
            description: 'Salle de sport moderne avec équipements dernier cri',
            address: {
                street: '123 Rue du Fitness',
                city: 'Paris',
                zipCode: '75001',
                country: 'France'
            },
            contactInfo: {
                phone: '+33123456789',
                email: 'contact@fitnesspro.com',
            },
            capacity: 150,
            images: [
            ],
            ownerId: ownerId,
            status: GymStatus.APPROVED,
            isActive: true,
            approvedAt: new Date()
        },
        {
            name: 'PowerGym Elite',
            description: 'Gym spécialisé en musculation et powerlifting',
            address: {
                street: '456 Avenue de la Force',
                city: 'Lyon',
                zipCode: '69001',
                country: 'France'
            },
            contactInfo: {
                phone: '+33234567890',
                email: 'info@powergym.com',
            },
            capacity: 100,
            images: [
            ],
            ownerId: ownerId,
            status: GymStatus.APPROVED,
            isActive: true,
            approvedAt: new Date()
        },
        {
            name: 'CrossFit Thunder',
            description: 'Box CrossFit pour entraînements fonctionnels',
            address: {
                street: '789 Boulevard du Sport',
                city: 'Marseille',
                zipCode: '13001',
                country: 'France'
            },
            contactInfo: {
                phone: '+33345678901',
                email: 'hello@crossfitthunder.com',
            },
            capacity: 80,
            images: [
            ],
            ownerId: ownerId,
            status: GymStatus.APPROVED,
            isActive: true,
            approvedAt: new Date()
        },
        {
            name: 'Wellness Studio',
            description: 'Studio de bien-être et fitness doux',
            address: {
                street: '321 Rue de la Sérénité',
                city: 'Nice',
                zipCode: '06000',
                country: 'France'
            },
            contactInfo: {
                phone: '+33456789012',
                email: 'contact@wellnessstudio.com',
            },
            capacity: 60,
            images: [
            ],
            ownerId: ownerId,
            status: GymStatus.APPROVED,
            isActive: true,
            approvedAt: new Date()
        }
    ];

    const createdGyms: Gym[] = [];

    for (const gymData of gymsData) {
        try {
            const existingGyms = await gymService.findActiveGyms();
            const existingGym = existingGyms.find((g: Gym) => g.name === gymData.name);
            
            if (!existingGym) {
                const gymModel = (gymService as any).gymModel;
                const gym = await gymModel.create(gymData);
                if (gym) {
                    createdGyms.push(gym);
                }
            } else {
                createdGyms.push(existingGym);
            }
        } catch (error) {
            // Ignore errors silently
        }
    }

    return createdGyms;
}
