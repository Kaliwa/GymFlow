import { Request, Response, Router, json } from "express";
import { sessionMiddleware } from "../middlewares";
import { requireRoleLevel } from "../middlewares/role.middleware";
import { BadgeType, BadgeRarity, UserRole } from "../models";
import { BadgeService, SessionService, UserService, WorkoutService } from "../services/mongoose/services";

export class BadgeController {
    constructor(
        private readonly badgeService: BadgeService,
        private readonly workoutService: WorkoutService,
        private readonly sessionService: SessionService,
        private readonly userService: UserService
    ) {}

    async createBadge(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const { name, description, icon, color, type, rarity, points, rules } = req.body;

            if (!name || !description || !icon || !color || !type || !points || !rules) {
                res.status(400).json({ error: "Champs requis manquants" });
                return;
            }

            if (!(type in BadgeType)) {
                res.status(400).json({ error: "Type de badge invalide" });
                return;
            }

            if (rarity && !(rarity in BadgeRarity)) {
                res.status(400).json({ error: "Rareté de badge invalide" });
                return;
            }

            if (!rules?.length) {
                res.status(400).json({ error: "Les règles doivent être un tableau non vide" });
                return;
            }

            const badge = await this.badgeService.createBadge({
                name,
                description,
                icon,
                color,
                type,
                rarity: rarity || BadgeRarity.COMMON,
                points,
                rules,
                isActive: true,
                createdBy: user._id
            });

            res.status(201).json(badge);
        } catch (error: any) {
            console.error('Erreur lors de la création du badge:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getAllBadges(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            const includeInactive = user?.role === UserRole.SUPER_ADMIN && req.query.includeInactive === 'true';
            
            const badges = await this.badgeService.findAllBadges(includeInactive);
            res.json(badges);
        } catch (error) {
            console.error('Erreur lors de la récupération des badges:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getBadgeById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const badge = await this.badgeService.findBadgeById(id);
            
            if (!badge) {
                res.status(404).json({ error: "Badge non trouvé" });
                return;
            }

            res.json(badge);
        } catch (error) {
            console.error('Erreur lors de la récupération du badge:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async updateBadge(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const badge = await this.badgeService.updateBadge(id, updateData);
            
            if (!badge) {
                res.status(404).json({ error: "Badge non trouvé" });
                return;
            }

            res.json(badge);
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour du badge:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async deleteBadge(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const success = await this.badgeService.deleteBadge(id);
            
            if (!success) {
                res.status(404).json({ error: "Badge non trouvé" });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erreur lors de la suppression du badge:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async toggleBadgeStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const badge = await this.badgeService.toggleBadgeStatus(id);
            
            if (!badge) {
                res.status(404).json({ error: "Badge non trouvé" });
                return;
            }

            res.json(badge);
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async awardBadge(req: Request, res: Response): Promise<void> {
        try {
            const { badgeId, userId } = req.body;
            const metadata = req.body.metadata || {};

            if (!badgeId || !userId) {
                res.status(400).json({ error: "Badge ID et User ID requis" });
                return;
            }

            const userBadge = await this.badgeService.awardBadgeToUser(userId, badgeId, metadata);
            
            if (!userBadge) {
                res.status(400).json({ error: "Impossible d'attribuer ce badge" });
                return;
            }

            res.status(201).json(userBadge);
        } catch (error) {
            console.error('Erreur lors de l\'attribution du badge:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getUserBadges(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const requestingUser = req.user;

            if (requestingUser?._id !== userId && requestingUser?.role !== UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: "Accès interdit" });
                return;
            }

            const userBadges = await this.badgeService.getUserBadges(userId);
            res.json(userBadges);
        } catch (error) {
            console.error('Erreur lors de la récupération des badges utilisateur:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getMyBadges(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const userBadges = await this.badgeService.getUserBadges(user._id);
            res.json(userBadges);
        } catch (error) {
            console.error('Erreur lors de la récupération de mes badges:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getMyBadgeProgress(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const progress = await this.badgeService.getUserBadgeProgress(user._id);
            res.json(progress);
        } catch (error) {
            console.error('Erreur lors de la récupération du progrès:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getBadgeLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const leaderboard = await this.badgeService.getBadgeLeaderboard(id, limit);
            res.json(leaderboard);
        } catch (error) {
            console.error('Erreur lors de la récupération du classement:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getBadgeStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this.badgeService.getBadgeStats();
            res.json(stats);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getBadgesByType(req: Request, res: Response): Promise<void> {
        try {
            const { type } = req.params;

            if (!(type in BadgeType)) {
                res.status(400).json({ error: "Type de badge invalide" });
                return;
            }

            const badges = await this.badgeService.findBadgesByType(type);
            res.json(badges);
        } catch (error) {
            console.error('Erreur lors de la récupération des badges par type:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getBadgesByRarity(req: Request, res: Response): Promise<void> {
        try {
            const { rarity } = req.params;

            if (!(rarity in BadgeRarity)) {
                res.status(400).json({ error: "Rareté de badge invalide" });
                return;
            }

            const badges = await this.badgeService.findBadgesByRarity(rarity);
            res.json(badges);
        } catch (error) {
            console.error('Erreur lors de la récupération des badges par rareté:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async checkUserBadges(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const userStats = await this.workoutService.getUserStats(user._id);
            const allBadges = await this.badgeService.findAllBadges();
            const newBadges = [];

            for (const badge of allBadges) {
                const hasUserBadge = await this.badgeService.getUserBadges(user._id);
                const alreadyHasBadge = hasUserBadge.some(ub => ub.badgeId.toString() === badge._id);
                
                if (!alreadyHasBadge && userStats) {
                    const meritsBadge = await this.badgeService.evaluateBadgeRules(user._id, badge, userStats);
                    if (meritsBadge) {
                        const newBadge = await this.badgeService.awardBadgeToUser(user._id, badge._id!);
                        if (newBadge) {
                            newBadges.push(newBadge);
                        }
                    }
                }
            }

            res.json({ 
                message: `${newBadges.length} nouveaux badges attribués`,
                newBadges 
            });
        } catch (error) {
            console.error('Erreur lors de la vérification des badges:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    buildRouter(): Router {
        const router = Router();
        
        router.use(sessionMiddleware(this.sessionService, this.userService));

        router.get("/", this.getAllBadges.bind(this));
        router.get("/my", this.getMyBadges.bind(this));
        router.get("/my/progress", this.getMyBadgeProgress.bind(this));
        router.get("/type/:type", this.getBadgesByType.bind(this));
        router.get("/rarity/:rarity", this.getBadgesByRarity.bind(this));
        router.get("/:id", this.getBadgeById.bind(this));
        router.get("/:id/leaderboard", this.getBadgeLeaderboard.bind(this));
        router.get("/user/:userId", this.getUserBadges.bind(this));
        router.post("/check", this.checkUserBadges.bind(this));

        router.post("/", json(), requireRoleLevel(3), this.createBadge.bind(this));
        router.put("/:id", json(), requireRoleLevel(3), this.updateBadge.bind(this));
        router.delete("/:id", requireRoleLevel(3), this.deleteBadge.bind(this));
        router.patch("/:id/toggle", requireRoleLevel(3), this.toggleBadgeStatus.bind(this));
        router.post("/award", json(), requireRoleLevel(3), this.awardBadge.bind(this));
        router.get("/stats/overview", requireRoleLevel(3), this.getBadgeStats.bind(this));

        return router;
    }
}
