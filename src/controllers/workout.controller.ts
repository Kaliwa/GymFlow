import { Request, Response, Router, json } from "express";
import { sessionMiddleware } from "../middlewares";
import { requireRoleLevel } from "../middlewares/role.middleware";
import { WorkoutType, UserRole, UserBadge } from "../models";
import { WorkoutService, SessionService, UserService, BadgeService } from "../services/mongoose/services";

export class WorkoutController {
    constructor(
        private readonly workoutService: WorkoutService,
        private readonly badgeService: BadgeService,
        private readonly sessionService: SessionService,
        private readonly userService: UserService
    ) { }

    async createWorkout(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const { name, type, duration, exercises, gymId, challengeId, caloriesBurned, notes } = req.body;

            if (!name || !type || !duration || !exercises) {
                res.status(400).json({ error: "Nom, type, durée et exercices requis" });
                return;
            }

            if (!(type in WorkoutType)) {
                res.status(400).json({ error: "Type de workout invalide" });
                return;
            }

            if (!exercises?.length) {
                res.status(400).json({ error: "Les exercices doivent être un tableau non vide" });
                return;
            }

            const workout = await this.workoutService.createWorkoutSession({
                userId: user._id,
                name,
                type,
                duration,
                exercises,
                gymId,
                challengeId,
                caloriesBurned,
                notes,
                startedAt: new Date(),
                isCompleted: false
            });

            res.status(201).json(workout);
        } catch (error) {
            console.error('Erreur lors de la création du workout:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getMyWorkouts(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const limit = parseInt(req.query.limit as string) || 20;
            const workouts = await this.workoutService.findUserWorkouts(user._id, limit);

            res.json(workouts);
        } catch (error) {
            console.error('Erreur lors de la récupération des workouts:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getWorkoutById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = req.user;

            const workout = await this.workoutService.findWorkoutById(id);

            if (!workout) {
                res.status(404).json({ error: "Workout non trouvé" });
                return;
            }

            if (workout.userId.toString() !== user?._id.toString() && user?.role !== UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: "Accès interdit" });
                return;
            }

            res.json(workout);
        } catch (error) {
            console.error('Erreur lors de la récupération du workout:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async completeWorkout(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = req.user;

            const workout = await this.workoutService.findWorkoutById(id);

            if (!workout) {
                res.status(404).json({ error: "Workout non trouvé" });
                return;
            }

            if (workout.userId.toString() !== user?._id.toString()) {
                console.warn(`User ${user?._id} tried to complete workout ${id} they do not own.`);
                console.warn(`Workout userId: ${workout.userId}, User _id: ${user?._id}`);
                res.status(403).json({ error: "Accès interdit" });
                return;
            }

            if (workout.isCompleted) {
                res.status(400).json({ error: "Workout déjà terminé" });
                return;
            }

            const completedWorkout = await this.workoutService.completeWorkout(id);

            if (!completedWorkout) {
                res.status(500).json({ error: "Erreur lors de la finalisation" });
                return;
            }

            const newBadges = await this.checkAndAwardBadges(user._id);

            res.json({
                workout: completedWorkout,
                newBadges,
                message: newBadges.length > 0 ? `Félicitations ! Vous avez gagné ${newBadges.length} nouveau(x) badge(s) !` : undefined
            });
        } catch (error) {
            console.error('Erreur lors de la finalisation du workout:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    private async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
        try {
            const userStats = await this.workoutService.getUserStats(userId);
            if (!userStats) {
                console.warn(`No user stats found for user ${userId}`);
                return [];
            }

            const [allBadges, userBadges] = await Promise.all([
                this.badgeService.findAllBadges(),
                this.badgeService.getUserBadges(userId)
            ]);

            const userBadgeIds = new Set(userBadges.map(ub => ub.badgeId.toString()));
            const newBadges: UserBadge[] = [];


            for (const badge of allBadges) {
                if (!badge._id || userBadgeIds.has(badge._id.toString())) {
                    continue;
                }

                const meritsBadge = await this.badgeService.evaluateBadgeRules(userId, badge, userStats);

                if (meritsBadge) {
                    const newBadge = await this.badgeService.awardBadgeToUser(userId, badge._id);
                    if (newBadge) {
                        newBadges.push(newBadge);
                    }
                }
            }

            return newBadges;
        } catch (error) {
            console.error('Error in checkAndAwardBadges:', error);
            return [];
        }
    }

    async updateWorkout(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = req.user;
            const updateData = req.body;

            const workout = await this.workoutService.findWorkoutById(id);

            if (!workout) {
                res.status(404).json({ error: "Workout non trouvé" });
                return;
            }

            if (workout.userId.toString() !== user?._id.toString()) {
                res.status(403).json({ error: "Accès interdit" });
                return;
            }

            const updatedWorkout = await this.workoutService.updateWorkout(id, updateData);

            if (!updatedWorkout) {
                res.status(500).json({ error: "Erreur lors de la mise à jour" });
                return;
            }

            res.json(updatedWorkout);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du workout:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async deleteWorkout(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = req.user;

            const workout = await this.workoutService.findWorkoutById(id);

            if (!workout) {
                res.status(404).json({ error: "Workout non trouvé" });
                return;
            }

            if (workout.userId.toString() !== user?._id.toString() && user?.role !== UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: "Accès interdit" });
                return;
            }

            const success = await this.workoutService.deleteWorkout(id);

            if (!success) {
                res.status(500).json({ error: "Erreur lors de la suppression" });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erreur lors de la suppression du workout:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getMyProgress(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const progress = await this.workoutService.getUserProgress(user._id);
            res.json(progress);
        } catch (error) {
            console.error('Erreur lors de la récupération du progrès:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getMyStats(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const stats = await this.workoutService.getUserStats(user._id);

            if (!stats) {
                res.status(404).json({ error: "Statistiques non trouvées" });
                return;
            }

            const badgeCount = await this.badgeService.getUserBadgeCount(user._id);
            stats.totalBadges = badgeCount;

            res.json(stats);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async testBadgeCheck(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const newBadges = await this.checkAndAwardBadges(user._id);

            const userStats = await this.workoutService.getUserStats(user._id);
            const allUserBadges = await this.badgeService.getUserBadges(user._id);

            res.json({
                message: `Test terminé. ${newBadges.length} nouveaux badges attribués.`,
                newBadges,
                userStats,
                totalBadges: allUserBadges.length,
                debug: {
                    userId: user._id,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Erreur lors du test de badges:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getWorkoutsByDateRange(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Non authentifié" });
                return;
            }

            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                res.status(400).json({ error: "Date de début et de fin requises" });
                return;
            }

            const workouts = await this.workoutService.getWorkoutsByDateRange(
                user._id,
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.json(workouts);
        } catch (error) {
            console.error('Erreur lors de la récupération des workouts par date:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getWorkoutsByGym(req: Request, res: Response): Promise<void> {
        try {
            const { gymId } = req.params;
            const limit = parseInt(req.query.limit as string) || 20;

            const workouts = await this.workoutService.getWorkoutsByGym(gymId, limit);
            res.json(workouts);
        } catch (error) {
            console.error('Erreur lors de la récupération des workouts par gym:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getWorkoutsByChallenge(req: Request, res: Response): Promise<void> {
        try {
            const { challengeId } = req.params;

            const workouts = await this.workoutService.getWorkoutsByChallenge(challengeId);
            res.json(workouts);
        } catch (error) {
            console.error('Erreur lors de la récupération des workouts par challenge:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.use(sessionMiddleware(this.sessionService, this.userService));

        router.post("/", json(), this.createWorkout.bind(this));
        router.get("/my", this.getMyWorkouts.bind(this));
        router.get("/my/progress", this.getMyProgress.bind(this));
        router.get("/my/stats", this.getMyStats.bind(this));
        router.get("/my/date-range", this.getWorkoutsByDateRange.bind(this));
        router.post("/my/test-badges", this.testBadgeCheck.bind(this));
        router.get("/:id", this.getWorkoutById.bind(this));
        router.patch("/:id/complete", this.completeWorkout.bind(this));
        router.put("/:id", json(), this.updateWorkout.bind(this));
        router.delete("/:id", this.deleteWorkout.bind(this));

        router.get("/gym/:gymId", requireRoleLevel(2), this.getWorkoutsByGym.bind(this));
        router.get("/challenge/:challengeId", requireRoleLevel(2), this.getWorkoutsByChallenge.bind(this));

        return router;
    }
}
