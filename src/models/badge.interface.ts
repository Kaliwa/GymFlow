import { Timestamps } from "./timestamps";

export enum BadgeType {
    WORKOUT = 'WORKOUT',
    CHALLENGE = 'CHALLENGE',
    SOCIAL = 'SOCIAL',
    ACHIEVEMENT = 'ACHIEVEMENT',
    STREAK = 'STREAK'
}

export enum BadgeRarity {
    COMMON = 'COMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY'
}

export interface BadgeRule {
    type: 'workout_count' | 'challenge_completed' | 'streak_days' | 'calories_burned' | 'gym_visits' | 'custom';
    operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
    value: number | [number, number];
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
    additionalCriteria?: Record<string, any>;
}

export interface Badge extends Timestamps {
    _id?: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    type: BadgeType;
    rarity: BadgeRarity;
    points: number;
    rules: BadgeRule[];
    isActive: boolean;
    createdBy: string;
}

export interface UserBadge extends Timestamps {
    _id?: string;
    userId: string;
    badgeId: string;
    awardedAt: Date;
    progress?: number;
    metadata?: Record<string, any>;
}

export interface BadgeProgress {
    badgeId: string;
    badge: Badge;
    progress: number;
    maxProgress: number;
    isCompleted: boolean;
    nextMilestone?: number;
}
