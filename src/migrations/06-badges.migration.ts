import { BadgeService } from "../services/mongoose/services";
import { Badge, BadgeType, BadgeRarity, BadgeRule } from "../models";

export async function seedBadges(badgeService: BadgeService, createdBy: string): Promise<Badge[]> {
    const defaultBadges = [
        {
            name: "Premier Pas",
            description: "Terminez votre premier entraînement",
            icon: "🎯",
            color: "#4CAF50",
            type: BadgeType.WORKOUT,
            rarity: BadgeRarity.COMMON,
            points: 10,
            isActive: true,
            createdBy: createdBy,
            rules: [
                {
                    type: 'workout_count' as const,
                    operator: 'gte' as const,
                    value: 1,
                    timeframe: 'all_time' as const
                }
            ]
        },
        {
            name: "Habitué",
            description: "Complétez 10 entraînements",
            icon: "🔥",
            color: "#FF9800",
            type: BadgeType.WORKOUT,
            rarity: BadgeRarity.COMMON,
            points: 50,
            isActive: true,
            createdBy: createdBy,
            rules: [
                {
                    type: 'workout_count' as const,
                    operator: 'gte' as const,
                    value: 10,
                    timeframe: 'all_time' as const
                }
            ]
        },
        {
            name: "Athlète",
            description: "Atteignez 50 entraînements terminés",
            icon: "💪",
            color: "#2196F3",
            type: BadgeType.WORKOUT,
            rarity: BadgeRarity.RARE,
            points: 200,
            isActive: true,
            createdBy: createdBy,
            rules: [
                {
                    type: 'workout_count' as const,
                    operator: 'gte' as const,
                    value: 50,
                    timeframe: 'all_time' as const
                }
            ]
        },
        {
            name: "Machine à Brûler",
            description: "Brûlez plus de 5000 calories au total",
            icon: "🔥",
            color: "#F44336",
            type: BadgeType.ACHIEVEMENT,
            rarity: BadgeRarity.RARE,
            points: 300,
            isActive: true,
            createdBy: createdBy,
            rules: [
                {
                    type: 'calories_burned' as const,
                    operator: 'gte' as const,
                    value: 5000,
                    timeframe: 'all_time' as const
                }
            ]
        },
        {
            name: "Endurant",
            description: "Cumulez plus de 100 heures d'entraînement",
            icon: "⏱️",
            color: "#9C27B0",
            type: BadgeType.ACHIEVEMENT,
            rarity: BadgeRarity.EPIC,
            points: 500,
            isActive: true,
            createdBy: createdBy,
            rules: [
                {
                    type: 'custom' as const,
                    operator: 'gte' as const,
                    value: 6000,
                    timeframe: 'all_time' as const,
                    additionalCriteria: { field: 'totalWorkoutMinutes' }
                }
            ]
        },
        {
            name: "Légende",
            description: "Complétez 200 entraînements",
            icon: "👑",
            color: "#FFD700",
            type: BadgeType.WORKOUT,
            rarity: BadgeRarity.LEGENDARY,
            points: 1000,
            isActive: true,
            createdBy: createdBy,
            rules: [
                {
                    type: 'workout_count' as const,
                    operator: 'gte' as const,
                    value: 200,
                    timeframe: 'all_time' as const
                }
            ]
        },
        {
            name: "Champion de Défi",
            description: "Terminez votre premier défi",
            icon: "🏆",
            color: "#FF5722",
            type: BadgeType.CHALLENGE,
            rarity: BadgeRarity.RARE,
            points: 150,
            isActive: true,
            createdBy: createdBy,
            rules: [
                {
                    type: 'challenge_completed' as const,
                    operator: 'gte' as const,
                    value: 1,
                    timeframe: 'all_time' as const
                }
            ]
        },
        {
            name: "Maître des Défis",
            description: "Complétez 10 défis différents",
            icon: "🏅",
            color: "#8BC34A",
            type: BadgeType.CHALLENGE,
            rarity: BadgeRarity.EPIC,
            points: 500,
            isActive: true,
            createdBy: createdBy,
            rules: [
                {
                    type: 'challenge_completed' as const,
                    operator: 'gte' as const,
                    value: 10,
                    timeframe: 'all_time' as const
                }
            ]
        }
    ];

    for (const badgeData of defaultBadges) {
        try {
            const existingBadge = await badgeService.findAllBadges().then(badges => 
                badges.find(b => b.name === badgeData.name)
            );
            
            if (!existingBadge) {
                await badgeService.createBadge(badgeData);
            }
        } catch (error) {
            console.error(`❌ Erreur lors de la création du badge ${badgeData.name}:`, error);
        }
    }
    
    const allBadges = await badgeService.findAllBadges(true);
    return allBadges;
}

