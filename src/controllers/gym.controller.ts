import { json, Request, Response, Router } from "express";
import express from "express";
import { GymService, CreateGymRequest, UserService } from "../services/mongoose/services";
import { SessionService } from "../services/mongoose/services";
import { sessionMiddleware } from "../middlewares";
import { GymStatus, User } from "../models";

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
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const gymData: CreateGymRequest = req.body;
            
            if (!gymData.name || !gymData.description || !gymData.address || !gymData.contactInfo) {
                res.status(400).json({ error: 'Données manquantes' });
                return;
            }

            const gym = await this.gymService.createGymRequest(gymData, user._id);
            
            if (!gym) {
                res.status(403).json({ error: 'Seuls les GYM_OWNER peuvent créer des demandes' });
                return;
            }

            res.status(201).json(gym);
        } catch (error) {
            console.error('Erreur lors de la création de la demande:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async getMyGymRequests(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const requests = await this.gymService.findGymRequestsByOwner(user._id);
            res.json(requests);
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async getPendingGymRequests(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const requests = await this.gymService.findPendingGymRequests(user._id);
            res.json(requests);
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async approveGymRequest(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;
            const { approvalNotes } = req.body;

            const gym = await this.gymService.approveGymRequest(id, user._id, approvalNotes);
            
            if (!gym) {
                res.status(403).json({ error: 'Impossible d\'approuver cette demande' });
                return;
            }

            res.json(gym);
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async rejectGymRequest(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;
            const { rejectionReason } = req.body;

            const gym = await this.gymService.rejectGymRequest(id, user._id, rejectionReason);
            
            if (!gym) {
                res.status(403).json({ error: 'Impossible de rejeter cette demande' });
                return;
            }

            res.json(gym);
        } catch (error) {
            console.error('Erreur lors du rejet:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async getMyGyms(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const gyms = await this.gymService.findGymsByOwner(user._id);
            res.json(gyms);
        } catch (error) {
            console.error('Erreur lors de la récupération des gyms:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async getActiveGyms(req: Request, res: Response): Promise<void> {
        try {
            const gyms = await this.gymService.findActiveGyms();
            res.json(gyms);
        } catch (error) {
            console.error('Erreur lors de la récupération des gyms actifs:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async getGymById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const gym = await this.gymService.findGymById(id);
            
            if (!gym) {
                res.status(404).json({ error: 'Gym non trouvé' });
                return;
            }

            res.json(gym);
        } catch (error) {
            console.error('Erreur lors de la récupération du gym:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async suspendGym(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;
            const { suspensionReason } = req.body;

            const gym = await this.gymService.suspendGym(id, user._id, suspensionReason);
            
            if (!gym) {
                res.status(403).json({ error: 'Impossible de suspendre ce gym' });
                return;
            }

            res.json(gym);
        } catch (error) {
            console.error('Erreur lors de la suspension:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async reactivateGym(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;

            const gym = await this.gymService.reactivateGym(id, user._id);
            
            if (!gym) {
                res.status(403).json({ error: 'Impossible de réactiver ce gym' });
                return;
            }

            res.json(gym);
        } catch (error) {
            console.error('Erreur lors de la réactivation:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async closeGym(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const { id } = req.params;

            const gym = await this.gymService.closeGym(id, user._id);
            
            if (!gym) {
                res.status(403).json({ error: 'Impossible de fermer ce gym' });
                return;
            }

            res.json(gym);
        } catch (error) {
            console.error('Erreur lors de la fermeture:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    private async getGymStats(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' });
                return;
            }

            const stats = await this.gymService.getGymStats();
            res.json(stats);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.use(sessionMiddleware(this.sessionService, this.userService));        
        router.post('/requests', json(), this.createGymRequest.bind(this));
        router.get('/requests/my', this.getMyGymRequests.bind(this));        
        router.get('/requests/pending', this.getPendingGymRequests.bind(this));        
        router.post('/requests/:id/approve', json(), this.approveGymRequest.bind(this));
        router.post('/requests/:id/reject', json(), this.rejectGymRequest.bind(this));
        router.get('/my', this.getMyGyms.bind(this));
        router.get('/active', this.getActiveGyms.bind(this));
        router.get('/:id', this.getGymById.bind(this));
        router.post('/:id/suspend', json(), this.suspendGym.bind(this));
        router.post('/:id/reactivate', this.reactivateGym.bind(this));
        router.post('/:id/close', this.closeGym.bind(this));
        router.get('/stats/overview', this.getGymStats.bind(this));

        return router;
    }
}
