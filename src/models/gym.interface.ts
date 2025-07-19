import { Address, ContactInfo } from "./common.interface";
import { Timestamps } from "./timestamps";

export enum GymStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED',
    CLOSED = 'CLOSED'
}

export interface Gym extends Timestamps {
    _id: string;
    ownerId: string;
    
    name: string;
    description: string;
    address: Address;
    contactInfo: ContactInfo;
    capacity: number;
    equipments?: string[];
    images: string[];
    
    status: GymStatus;
    
    submittedAt: Date;
    reviewedAt?: Date;
    approvedAt?: Date;
    suspendedAt?: Date;
    closedAt?: Date;
    
    reviewedBy?: string;
    approvalNotes?: string;
    rejectionReason?: string;
    suspensionReason?: string;
    
    isActive?: boolean;
    rating?: number;
    totalReviews?: number;
}

export function isGymOperational(gym: Gym): boolean {
    return gym.status === GymStatus.APPROVED && gym.isActive === true;
}

export function isGymPending(gym: Gym): boolean {
    return gym.status === GymStatus.PENDING;
}

export function canGymBeReviewed(gym: Gym): boolean {
    return gym.status === GymStatus.PENDING;
}

export function getGymStatusLabel(status: GymStatus): string {
    const labels = {
        [GymStatus.PENDING]: 'En attente d\'approbation',
        [GymStatus.APPROVED]: 'Approuvé',
        [GymStatus.REJECTED]: 'Rejeté',
        [GymStatus.SUSPENDED]: 'Suspendu',
        [GymStatus.CLOSED]: 'Fermé'
    };
    return labels[status];
}
