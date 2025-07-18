import { Request, Response, Router, json } from "express";
import { UserService, SessionService } from "../services/mongoose/services";
import { Session, UserRole } from "../models";
import { sessionMiddleware } from "../middlewares";

export class AuthController {
    constructor(public readonly userService: UserService, public readonly sessionService: SessionService) { }

    async login(req: Request, res: Response) {
        if(!req.body || !req.body.email || !req.body.password) {
            res.status(400).end()
            return;
        }

        const user = await this.userService.findUser(
            req.body.email, 
            req.body.password
        );

        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const session = await this.sessionService.createSession({
            user: user,
            expirationDate: new Date(Date.now() + 1_296_080_000),
        });

        res.status(200).json(session);
    }

    async me(req: Request, res: Response) {
        res.json(req.user);
    }

    async subscribe(req: Request, res: Response) {
        if (!req.body || !req.body.email || !req.body.password || !req.body.lastName || !req.body.firstName) {
            res.status(400).end();
            return;
        }

        try {
            const user = await this.userService.createUser({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                role: UserRole.USER,
                isActive: true
            })
            res.status(201).json(user);
        } catch (error) {
            res.status(409).json({ error: 'User already exists' });
            return;
        }
    }

    async updateUserRole(req: Request, res: Response) {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({ error: 'Only SUPER_ADMIN can update user roles' });
        }

        const { userId, role } = req.body;

        if (!userId || !role) {
            return res.status(400).json({ error: 'userId and role are required' });
        }

        if (!Object.values(UserRole).includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        try {
            await this.userService.updateRole(userId, role);
            res.json({ message: 'User role updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update user role' });
        }
    }

    buildRouter(): Router {
        const router = Router();
        router.post('/login', json(), this.login.bind(this));
        router.post('/subscribe', json(), this.subscribe.bind(this));
        router.get('/me', sessionMiddleware(this.sessionService, this.userService), this.me.bind(this));
        router.post('/update-role', sessionMiddleware(this.sessionService, this.userService), json(), this.updateUserRole.bind(this));
        return router;
    }
}