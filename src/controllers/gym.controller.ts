import { json, Request, Response, Router } from "express";
import { sessionMiddleware } from "../middlewares";
import { requireRoleLevel } from "../middlewares/role.middleware";
import { GymService, CreateGymRequest, UserService , SessionService } from "../services/mongoose/services";

export class GymController {
    
    constructor(
        private readonly gymService: GymService,
        private readonly sessionService: SessionService,
        private readonly userService: UserService
    ) {}

    private async createGymRequest(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const gymData: CreateGymRequest = req.body;
            
            if (!gymData.name || !gymData.description || !gymData.address || !gymData.contactInfo) {
                res.status(400).json({ _error: 'Données manquantes' });
                return;
            }

            const gym = await this.gymService.createGymRequest(gymData, user._id);
            
            if (!gym) {
                res.status(403).json({ _error: 'Seuls les GYM_OWNER peuvent créer des demandes' });
                return;
            }

            res.status(201).json(gym);
        } catch (_error) {
            console.error('Erreur lors de la création de la demande:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async getMyGymRequests(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const requests = await this.gymService.findGymRequestsByOwner(user._id);
            res.json(requests);
        } catch (_error) {
            console.error('Erreur lors de la récupération des demandes:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async getPendingGymRequests(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const requests = await this.gymService.findPendingGymRequests(user._id);
            res.json(requests);
        } catch (_error) {
            console.error('Erreur lors de la récupération des demandes:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async approveGymRequest(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;
            const { approvalNotes } = req.body;

            const gym = await this.gymService.approveGymRequest(id, user._id, approvalNotes);
            
            if (!gym) {
                res.status(403).json({ _error: 'Impossible d\'approuver cette demande' });
                return;
            }

            res.json(gym);
        } catch (_error) {
            console.error('Erreur lors de l\'approbation:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async rejectGymRequest(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;
            const { rejectionReason } = req.body;

            const gym = await this.gymService.rejectGymRequest(id, user._id, rejectionReason);
            
            if (!gym) {
                res.status(403).json({ _error: 'Impossible de rejeter cette demande' });
                return;
            }

            res.json(gym);
        } catch (_error) {
            console.error('Erreur lors du rejet:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async getMyGyms(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const gyms = await this.gymService.findGymsByOwner(user._id);
            res.json(gyms);
        } catch (_error) {
            console.error('Erreur lors de la récupération des gyms:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async getActiveGyms(req: Request, res: Response): Promise<void> {
        try {
            const gyms = await this.gymService.findActiveGyms();
            res.json(gyms);
        } catch (_error) {
            console.error('Erreur lors de la récupération des gyms actifs:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async getGymById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const gym = await this.gymService.findGymById(id);
            
            if (!gym) {
                res.status(404).json({ _error: 'Gym non trouvé' });
                return;
            }

            res.json(gym);
        } catch (_error) {
            console.error('Erreur lors de la récupération du gym:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async suspendGym(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;
            const { suspensionReason } = req.body;

            const gym = await this.gymService.suspendGym(id, user._id, suspensionReason);
            
            if (!gym) {
                res.status(403).json({ _error: 'Impossible de suspendre ce gym' });
                return;
            }

            res.json(gym);
        } catch (_error) {
            console.error('Erreur lors de la suspension:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async reactivateGym(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;

            const gym = await this.gymService.reactivateGym(id, user._id);
            
            if (!gym) {
                res.status(403).json({ _error: 'Impossible de réactiver ce gym' });
                return;
            }

            res.json(gym);
        } catch (_error) {
            console.error('Erreur lors de la réactivation:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async closeGym(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;

            const gym = await this.gymService.closeGym(id, user._id);
            
            if (!gym) {
                res.status(403).json({ _error: 'Impossible de fermer ce gym' });
                return;
            }

            res.json(gym);
        } catch (_error) {
            console.error('Erreur lors de la fermeture:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async getGymStats(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ _error: 'Utilisateur non trouvé' });
                return;
            }

            const stats = await this.gymService.getGymStats();
            res.json(stats);
        } catch (_error) {
            console.error('Erreur lors de la récupération des statistiques:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    private async updateGymEquipments(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
   
        const { equipments } = req.body;
        if (!Array.isArray(equipments)) {
            res.status(400).json({ _error: "equipments doit être un tableau d'IDs" });
            return;
        }
        try {
            const gym = await this.gymService.updateGymEquipments(id, equipments);
            if (!gym) {
                res.status(404).json({ _error: "Gym non trouvé" });
                return;
            }
            res.json(gym);
        } catch (_error) {
            console.error('Erreur lors de la mise à jour des équipements:', _error);
            res.status(500).json({ _error: 'Erreur serveur' });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.use(sessionMiddleware(this.sessionService, this.userService));
        router.post('/requests', json(), this.createGymRequest.bind(this));
        router.get('/requests/my', this.getMyGymRequests.bind(this));
        router.get('/requests/pending', requireRoleLevel(3), this.getPendingGymRequests.bind(this));
        router.post('/requests/:id/approve', json(), requireRoleLevel(3), this.approveGymRequest.bind(this));
        router.post('/requests/:id/reject', json(), requireRoleLevel(3), this.rejectGymRequest.bind(this));
        router.get('/my', this.getMyGyms.bind(this));
        router.patch('/:id/equipments', json(), requireRoleLevel(3), this.updateGymEquipments.bind(this));
        router.get('/active', this.getActiveGyms.bind(this));
        router.get('/:id', this.getGymById.bind(this));
        router.post('/:id/suspend', json(), requireRoleLevel(3), this.suspendGym.bind(this));
        router.post('/:id/reactivate', requireRoleLevel(3), this.reactivateGym.bind(this));
        router.post('/:id/close', requireRoleLevel(3), this.closeGym.bind(this));
        router.get('/stats/overview', requireRoleLevel(3), this.getGymStats.bind(this));

        return router;
    }
}
