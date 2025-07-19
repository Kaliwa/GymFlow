import {Timestamps} from "./timestamps";
import {User} from "./user.interface";

export interface Session extends Timestamps {
    _id: string;
    expirationDate?: Date;
    user: string | User;
}