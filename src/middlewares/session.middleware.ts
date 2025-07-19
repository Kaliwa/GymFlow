import { RequestHandler, Request, Response, NextFunction } from "express";
import { User, Session } from "../models";
import { SessionService, UserService } from "../services/mongoose/services";

declare module 'express'  {
    interface Request {
        session?: Session;
        user?: User;
    }
}
export function sessionMiddleware(sessionService: SessionService, userService: UserService): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authorization = req.headers['authorization'] as string | undefined;
        if (!authorization) {
            res.status(401).json({ _error: 'Unauthorized because no authorization' });
            return;
        }

        const parts = authorization.split(' ')

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({ _error: 'Nothing behind bearer' });
            return;
        }

        const token = parts[1];
        const session = await sessionService.findActiveSession(token);

        if (!session) {
            res.status(401).json({ _error: 'No session' });
            return;
        }

        const user = await userService.findUserById((session.user as User)._id);
        if (!user) {
            res.status(401).json({ _error: 'User not found' });
            return;
        }

        req.session = session;
        req.user = user;
        next();
    }
}