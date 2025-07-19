import { Request, Response, Router, json } from "express";
import { sessionMiddleware } from "../middlewares";
import { requireRoleLevel } from "../middlewares/role.middleware";
import { UserRole } from "../models";
import { UserService, SessionService } from "../services/mongoose/services";

export class AuthController {
    constructor(public readonly _userService: UserService, public readonly _sessionService: SessionService) { }

    async login(req: Request, res: Response) {
        if (!req.body || !req.body.email || !req.body.password) {
            res.status(400).end()
            return;
        }

        const user = await this._userService.findUser(
            req.body.email,
            req.body.password
        );

        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const session = await this._sessionService.createSession({
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
            const user = await this._userService.createUser({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                role: UserRole.USER,
                isActive: true
            })
            res.status(201).json(user);
        } catch (_error) {
            console.error(_error);
            res.status(409).json({ _error: 'User already exists' });
            return;
        }
    }

    async updateUserRole(req: Request, res: Response) {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ _error: 'email and role are required' });
        }

        if (!(role in UserRole)) {
            return res.status(400).json({ _error: 'Invalid role' });
        }

        try {
            await this._userService.updateRoleByEmail(email, role);
            res.json({ message: 'User role updated successfully' });
        } catch (_error) {
            console.error(_error);
            res.status(500).json({ _error: 'Failed to update user role' });
        }
    }

    async deactivateUser(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "ID manquant" });
        try {
            const user = await this._userService.deactivateUser(id);
            if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
            res.json({ message: "Utilisateur désactivé", user });
        } catch (e: any) {
            res.status(500).json({ error: e.message || "Erreur lors de la désactivation" });
        }
    }

    async activateUser(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "ID manquant" });
        try {
            const user = await this._userService.activateUser(id);
            if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
            res.json({ message: "Utilisateur activé", user });
        } catch (e: any) {
            res.status(500).json({ error: e.message || "Erreur lors de l'activation" });
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "ID manquant" });
        try {
            const ok = await this._userService.deleteUser(id);
            if (!ok) return res.status(404).json({ error: "Utilisateur non trouvé" });
            res.json({ message: "Utilisateur supprimé" });
        } catch (e: any) {
            res.status(500).json({ error: e.message || "Erreur lors de la suppression" });
        }
    }

    buildRouter(): Router {
        const router = Router();
        router.post('/login', json(), this.login.bind(this));
        router.post('/subscribe', json(), this.subscribe.bind(this));
        router.get('/me', sessionMiddleware(this._sessionService, this._userService), this.me.bind(this));
        router.post('/update-role', sessionMiddleware(this._sessionService, this._userService), requireRoleLevel(3), json(), this.updateUserRole.bind(this));
        router.patch('/deactivate/:id', sessionMiddleware(this._sessionService, this._userService), requireRoleLevel(3), this.deactivateUser.bind(this));
        router.patch('/activate/:id', sessionMiddleware(this._sessionService, this._userService), requireRoleLevel(3), this.activateUser.bind(this));
        router.delete('/:id', sessionMiddleware(this._sessionService, this._userService), requireRoleLevel(3), this.deleteUser.bind(this));
        return router;
    }
}