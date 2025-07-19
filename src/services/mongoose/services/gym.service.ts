import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Equipment, Gym, GymStatus, User, UserRole, getUserRoleLevel } from "../../../models";

export type CreateGymRequest = Omit<Gym, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'reviewedBy' | 'approvedAt' | 'suspendedAt' | 'closedAt' | 'approvalNotes' | 'rejectionReason' | 'suspensionReason' | 'isActive' | 'rating' | 'totalReviews'>;

export class GymService {

    readonly gymModel: Model<Gym>;
    readonly userModel: Model<User>;

    constructor(public readonly _connection: Mongoose) {
        this.gymModel = _connection.model<Gym>('Gym');
        this.userModel = _connection.model<User>('User');
    }

    private async isUserSuperAdmin(userId: string): Promise<boolean> {
        if (!isValidObjectId(userId)) {
            return false;
        }
        const user = await this.userModel.findById(userId);
        return user ? getUserRoleLevel(user.role) >= getUserRoleLevel(UserRole.SUPER_ADMIN) : false;
    }

    private async isUserGymOwner(userId: string): Promise<boolean> {
        if (!isValidObjectId(userId)) {
            return false;
        }
        const user = await this.userModel.findById(userId);
        return user ? user.role === UserRole.GYM_OWNER : false;
    }

    async createGymRequest(gymData: CreateGymRequest, ownerId: string): Promise<Gym | null> {
        if (!await this.isUserGymOwner(ownerId)) {
            return null;
        }

        return this.gymModel.create({
            ...gymData,
            ownerId,
            status: GymStatus.PENDING,
            submittedAt: new Date(),
            isActive: true
        });
    }

    async findEquipmentsByIds(equipmentIds: string[]): Promise<Equipment[]> {
        if (!Array.isArray(equipmentIds) || equipmentIds.length === 0) {
            return [];
        }
        const validIds = equipmentIds.filter(id => isValidObjectId(id));
        if (validIds.length === 0) {
            return [];
        }
        const equipmentModel = this._connection.model<Equipment>('Equipment');
        return equipmentModel.find({ _id: { $in: validIds } });
    }

    async findGymRequestsByOwner(ownerId: string): Promise<Gym[]> {
        if (!await this.isUserGymOwner(ownerId)) {
            return [];
        }

        return this.gymModel.find({ ownerId }).sort({ submittedAt: -1 });
    }

    async findPendingGymRequests(userId: string): Promise<Gym[]> {
        if (!await this.isUserSuperAdmin(userId)) {
            return [];
        }

        return this.gymModel.find({ status: GymStatus.PENDING }).sort({ submittedAt: -1 });
    }

    async findGymRequestById(requestId: string): Promise<Gym | null> {
        if (!isValidObjectId(requestId)) {
            return null;
        }

        return this.gymModel.findById(requestId);
    }

    async approveGymRequest(requestId: string, adminId: string, approvalNotes?: string): Promise<Gym | null> {
        if (!await this.isUserSuperAdmin(adminId)) {
            return null;
        }

        const gym = await this.findGymRequestById(requestId);
        if (!gym || gym.status !== GymStatus.PENDING) {
            return null;
        }

        const updatedGym = await this.gymModel.findByIdAndUpdate(
            requestId,
            {
                $set: {
                    status: GymStatus.APPROVED,
                    reviewedAt: new Date(),
                    approvedAt: new Date(),
                    reviewedBy: adminId,
                    approvalNotes,
                    isActive: true
                }
            },
            { new: true }
        );

        return updatedGym;
    }

    async rejectGymRequest(requestId: string, adminId: string, rejectionReason?: string): Promise<Gym | null> {
        if (!await this.isUserSuperAdmin(adminId)) {
            return null;
        }

        const gym = await this.findGymRequestById(requestId);
        if (!gym || gym.status !== GymStatus.PENDING) {
            return null;
        }

        const updatedGym = await this.gymModel.findByIdAndUpdate(
            requestId,
            {
                $set: {
                    status: GymStatus.REJECTED,
                    reviewedAt: new Date(),
                    reviewedBy: adminId,
                    rejectionReason
                }
            },
            { new: true }
        );

        return updatedGym;
    }

    async findGymsByOwner(ownerId: string): Promise<Gym[]> {
        if (!await this.isUserGymOwner(ownerId)) {
            return [];
        }

        return this.gymModel.find({
            ownerId,
            status: GymStatus.APPROVED
        }).sort({ approvedAt: -1 });
    }

    async findActiveGyms(): Promise<Gym[]> {
        return this.gymModel.find({
            status: GymStatus.APPROVED,
            isActive: true
        }).sort({ approvedAt: -1 });
    }

    async findGymById(gymId: string): Promise<Gym | null> {
        if (!isValidObjectId(gymId)) {
            return null;
        }

        return this.gymModel.findById(gymId);
    }

    async suspendGym(gymId: string, adminId: string, suspensionReason?: string): Promise<Gym | null> {
        if (!await this.isUserSuperAdmin(adminId)) {
            return null;
        }

        const gym = await this.findGymById(gymId);
        if (!gym || gym.status !== GymStatus.APPROVED) {
            return null;
        }

        const updatedGym = await this.gymModel.findByIdAndUpdate(
            gymId,
            {
                $set: {
                    status: GymStatus.SUSPENDED,
                    suspendedAt: new Date(),
                    suspensionReason,
                    isActive: false
                }
            },
            { new: true }
        );

        return updatedGym;
    }

    async reactivateGym(gymId: string, adminId: string): Promise<Gym | null> {
        if (!await this.isUserSuperAdmin(adminId)) {
            return null;
        }

        const gym = await this.findGymById(gymId);
        if (!gym || gym.status !== GymStatus.SUSPENDED) {
            return null;
        }

        const updatedGym = await this.gymModel.findByIdAndUpdate(
            gymId,
            {
                $set: {
                    status: GymStatus.APPROVED,
                    isActive: true,
                    suspendedAt: undefined,
                    suspensionReason: undefined
                }
            },
            { new: true }
        );

        return updatedGym;
    }

    async updateGymEquipments(gymId: string, equipmentIds: string[]): Promise<Gym | null> {
        if (!isValidObjectId(gymId)) return null;
        
        if (!Array.isArray(equipmentIds) || equipmentIds.length === 0) {
            return this.gymModel.findByIdAndUpdate(
                gymId,
                { $set: { equipments: [] } },
                { new: true }
            );
        }

        return this.gymModel.findByIdAndUpdate(
            gymId,
            { $set: { equipments: equipmentIds } },
            { new: true }
        );
    }

    async closeGym(gymId: string, adminId: string): Promise<Gym | null> {
        if (!await this.isUserSuperAdmin(adminId)) {
            return null;
        }

        const gym = await this.findGymById(gymId);
        if (!gym || gym.status === GymStatus.CLOSED) {
            return null;
        }

        const updatedGym = await this.gymModel.findByIdAndUpdate(
            gymId,
            {
                $set: {
                    status: GymStatus.CLOSED,
                    closedAt: new Date(),
                    isActive: false
                }
            },
            { new: true }
        );

        return updatedGym;
    }

    async getGymStats(): Promise<{
        totalGyms: number;
        pendingRequests: number;
        approvedGyms: number;
        rejectedRequests: number;
        suspendedGyms: number;
        closedGyms: number;
    }> {
        const [
            totalGyms,
            pendingRequests,
            approvedGyms,
            rejectedRequests,
            suspendedGyms,
            closedGyms
        ] = await Promise.all([
            this.gymModel.countDocuments(),
            this.gymModel.countDocuments({ status: GymStatus.PENDING }),
            this.gymModel.countDocuments({ status: GymStatus.APPROVED }),
            this.gymModel.countDocuments({ status: GymStatus.REJECTED }),
            this.gymModel.countDocuments({ status: GymStatus.SUSPENDED }),
            this.gymModel.countDocuments({ status: GymStatus.CLOSED })
        ]);

        return {
            totalGyms,
            pendingRequests,
            approvedGyms,
            rejectedRequests,
            suspendedGyms,
            closedGyms
        };
    }
}
