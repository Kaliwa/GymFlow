import { Request, Response, Router, json } from "express";
import { ChallengeService } from "../services/mongoose/services";
import { requireRoleLevel } from "../middlewares/role.middleware";
import { sessionMiddleware } from "../middlewares";
import { SessionService, UserService } from "../services/mongoose/services";

export class ChallengeController {
  constructor(
    private readonly challengeService: ChallengeService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) {}

  async create(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });
    
    const { title, description, gym, equipments, exercises, difficulty } = req.body;
    if (!title || !description || !gym) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    try {
      const challenge = await this.challengeService.createChallenge({
        title,
        description,
        gym,
        createdBy: user._id!,
        equipments,
        exercises,
        difficulty,
        isActive: false
      });

      const populated = await this.challengeService.findByIdWithPopulate(challenge._id?.toString() || "");
      res.status(201).json(populated);
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Erreur lors de la création du défi" });
    }
  }

  async findByGym(req: Request, res: Response) {
    const { gymId } = req.params;
    try {
      const challenges = await this.challengeService.findByGymWithPopulate(gymId);
      res.json(challenges);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Erreur lors de la récupération des défis" });
    }
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const challenge = await this.challengeService.findByIdWithPopulate(id);
      if (!challenge) {
        return res.status(404).json({ error: "Défi non trouvé" });
      }
      res.json(challenge);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Erreur lors de la récupération du défi" });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const challenges = await this.challengeService.findAllChallenges();
      res.json(challenges);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Erreur lors de la récupération des défis" });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    try {
      const existingChallenge = await this.challengeService.findById(id);
      if (!existingChallenge) {
        return res.status(404).json({ error: "Défi non trouvé" });
      }

      if (existingChallenge.createdBy.toString() !== user._id?.toString()) {
        return res.status(403).json({ error: "Vous n'avez pas l'autorisation de modifier ce défi" });
      }

      const updatedChallenge = await this.challengeService.updateChallenge(id, req.body);
      const populated = await this.challengeService.findByIdWithPopulate(id);
      res.json(populated);
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Erreur lors de la mise à jour du défi" });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    try {
      const existingChallenge = await this.challengeService.findById(id);
      if (!existingChallenge) {
        return res.status(404).json({ error: "Défi non trouvé" });
      }

      if (existingChallenge.createdBy.toString() !== user._id?.toString()) {
        return res.status(403).json({ error: "Vous n'avez pas l'autorisation de supprimer ce défi" });
      }

      const deleted = await this.challengeService.deleteChallenge(id);
      if (!deleted) {
        return res.status(404).json({ error: "Échec de la suppression du défi" });
      }

      res.status(204).send();
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Erreur lors de la suppression du défi" });
    }
  }

  buildRouter(): Router {
    const router = Router();
    router.use(sessionMiddleware(this.sessionService, this.userService));
    router.post("/", json(), requireRoleLevel(2), this.create.bind(this));
    router.get("/", requireRoleLevel(3), this.findAll.bind(this));
    router.get("/gym/:gymId", this.findByGym.bind(this));
    router.get("/:id", this.findById.bind(this));
    router.patch("/:id", json(), requireRoleLevel(2), this.update.bind(this));
    router.delete("/:id", requireRoleLevel(2), this.delete.bind(this));
    return router;
  }
}
