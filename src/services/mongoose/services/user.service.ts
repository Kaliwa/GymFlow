import {Mongoose, Model, FilterQuery, isValidObjectId} from "mongoose";
import {User, UserRole} from "../../../models";
import {userSchema} from "../schema";
import { sha512 } from "../../../utils";

export type CreateUser = Omit<User, '_id' | 'createdAt' | 'updatedAt'> & {
    isActive?: boolean;
}

export class UserService {

    readonly userModel: Model<User>;

    constructor(public readonly connection: Mongoose) {
        this.userModel = connection.model('User', userSchema());
    }

    async findUser(email: string, password?: string): Promise<User | null>{
        const filter: FilterQuery<User> = {email: email};
        
        if (password) {
            filter.password = sha512(password);
        }

        return this.userModel.findOne(filter)
    }

    async createUser(user: CreateUser): Promise<User> {
        return this.userModel.create({
            ...user, 
            password: sha512(user.password),
            isActive: user.isActive ?? true
        })
    }

    async updateRole(userId: string, role: UserRole): Promise<void> {
        if(!isValidObjectId(userId)) {
            return;
        }

        await this.userModel.updateOne(
            {_id: userId},
            {$set: {role: role}}
        )
    }
}