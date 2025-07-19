import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Session } from "../../../models";


export type CreateSession = Omit<Session, '_id' | 'createdAt' | 'updatedAt'>;

export class SessionService {

    readonly sessionModel: Model<Session>;

    constructor(public readonly _connection: Mongoose) {
        this.sessionModel = _connection.model<Session>('Session');
    }

    async createSession(session: CreateSession): Promise<Session> {
        return this.sessionModel.create(session);
    }

    async findActiveSession(sessionId: string): Promise<Session | null> {
        if(!isValidObjectId(sessionId)) {
            return null;
        }
        const session = await this.sessionModel.findOne({
            _id: sessionId,
            expirationDate: { $gt: new Date() }
        }).populate('user');
        return session;
    }
}