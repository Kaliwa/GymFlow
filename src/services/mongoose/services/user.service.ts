import { Mongoose, Model, FilterQuery, isValidObjectId } from "mongoose";
import { User, UserRole } from "../../../models";
import { sha512 } from "../../../utils";

export type CreateUser = Omit<User, '_id' | 'createdAt' | 'updatedAt'> & {
    isActive?: boolean;
}

export class UserService {
    readonly userModel: Model<User>;

    constructor(public readonly _connection: Mongoose) {
        this.userModel = _connection.model<User>('User');
    }

    async findUser(email: string, password?: string): Promise<User | null> {
        const filter: FilterQuery<User> = { email: email };

        if (password) {
            filter.password = sha512(password);
        }

        const user = await this.userModel.findOne(filter);

        if (!user?.isActive) {
            return null;
        }

        return user;
    }

    async findUserById(userId: string): Promise<User | null> {
        if (!isValidObjectId(userId)) {
            return null;
        }
        return this.userModel.findById(userId)
    }

    async createUser(user: CreateUser): Promise<User> {
        return this.userModel.create({
            ...user,
            password: sha512(user.password),
            isActive: user.isActive ?? true
        })
    }

    async updateRoleByEmail(email: string, role: UserRole): Promise<void> {
        await this.userModel.updateOne(
            { email: email },
            { $set: { role: role } }
        )
    }
    async deactivateUser(id: string) {
        return this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }

    async activateUser(id: string) {
        return this.userModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
    }

    async deleteUser(id: string) {
        const res = await this.userModel.findByIdAndDelete(id);
        return res;
    }
}