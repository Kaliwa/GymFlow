import { Request, Response, Router, json } from "express";
import {
  ChallengeService,
  ChallengeParticipationService,
  FriendshipService,
} from "../services/mongoose/services";
import { requireRoleLevel } from "../middlewares/role.middleware";
import { sessionMiddleware } from "../middlewares";
import { SessionService, UserService } from "../services/mongoose/services";

export class ChallengeController {
  constructor(
    private readonly challengeService: ChallengeService,
    private readonly challengeParticipationService: ChallengeParticipationService,
    private readonly friendshipService: FriendshipService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) {}

  async create(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { title, description, gym, equipments, exercises, difficulty } =
      req.body;
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
        type: req.body.type || "INDIVIDUAL",
        isPrivate: req.body.isPrivate || false,
        requiresInvitation: req.body.requiresInvitation || false,
        maxParticipants: req.body.maxParticipants,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        isActive: false,
      });

      const populated = await this.challengeService.findByIdWithPopulate(
        challenge._id?.toString() || ""
      );
      res.status(201).json(populated);
    } catch (e: any) {
      res
        .status(400)
        .json({ error: e.message || "Erreur lors de la création du défi" });
    }
  }

  async findByGym(req: Request, res: Response) {
    const { gymId } = req.params;
    try {
      const challenges = await this.challengeService.findByGymWithPopulate(
        gymId
      );
      res.json(challenges);
    } catch (e: any) {
      res.status(500).json({
        error: e.message || "Erreur lors de la récupération des défis",
      });
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
      res
        .status(500)
        .json({ error: e.message || "Erreur lors de la récupération du défi" });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const challenges = await this.challengeService.findAllChallenges();
      res.json(challenges);
    } catch (e: any) {
      res.status(500).json({
        error: e.message || "Erreur lors de la récupération des défis",
      });
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
        return res.status(403).json({
          error: "Vous n'avez pas l'autorisation de modifier ce défi",
        });
      }

      const updatedChallenge = await this.challengeService.updateChallenge(
        id,
        req.body
      );
      const populated = await this.challengeService.findByIdWithPopulate(id);
      res.json(populated);
    } catch (e: any) {
      res
        .status(400)
        .json({ error: e.message || "Erreur lors de la mise à jour du défi" });
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
        return res.status(403).json({
          error: "Vous n'avez pas l'autorisation de supprimer ce défi",
        });
      }

      const deleted = await this.challengeService.deleteChallenge(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ error: "Échec de la suppression du défi" });
      }

      res.status(204).send();
    } catch (e: any) {
      res
        .status(500)
        .json({ error: e.message || "Erreur lors de la suppression du défi" });
    }
  }

  async inviteToChallenge(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { challengeId } = req.params;
    const { inviteeId, message } = req.body;

    if (!inviteeId) {
      return res.status(400).json({ error: "ID de l'invité requis" });
    }

    try {
      const challenge = await this.challengeService.findById(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Défi non trouvé" });
      }

      if (challenge.createdBy.toString() !== user._id!.toString()) {
        const isParticipating =
          await this.challengeParticipationService.isUserParticipating(
            challengeId,
            user._id!
          );
        if (!isParticipating) {
          return res
            .status(403)
            .json({ error: "Seul le créateur ou un participant peut inviter" });
        }
      }

      const areFriends = await this.friendshipService.areFriends(
        user._id!,
        inviteeId
      );
      if (!areFriends) {
        return res
          .status(403)
          .json({ error: "Vous pouvez seulement inviter vos amis" });
      }

      const invitation =
        await this.challengeParticipationService.inviteToChallenge(
          challengeId,
          user._id!,
          inviteeId,
          message
        );

      if (!invitation) {
        return res
          .status(400)
          .json({ error: "Impossible d'envoyer l'invitation" });
      }

      res.status(201).json(invitation);
    } catch (e: any) {
      res
        .status(500)
        .json({ error: e.message || "Erreur lors de l'invitation" });
    }
  }

  async acceptInvitation(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { invitationId } = req.params;

    try {
      const participation =
        await this.challengeParticipationService.acceptInvitation(
          invitationId,
          user._id!
        );

      if (!participation) {
        return res
          .status(400)
          .json({ error: "Impossible d'accepter cette invitation" });
      }

      res.json(participation);
    } catch (e: any) {
      res
        .status(500)
        .json({ error: e.message || "Erreur lors de l'acceptation" });
    }
  }

  async declineInvitation(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { invitationId } = req.params;

    try {
      const success =
        await this.challengeParticipationService.declineInvitation(
          invitationId,
          user._id!
        );

      if (!success) {
        return res
          .status(400)
          .json({ error: "Impossible de refuser cette invitation" });
      }

      res.status(204).send();
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Erreur lors du refus" });
    }
  }

  async joinChallenge(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { challengeId } = req.params;

    try {
      const challenge = await this.challengeService.findById(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Défi non trouvé" });
      }

      if (challenge.isPrivate || challenge.requiresInvitation) {
        return res
          .status(403)
          .json({ error: "Ce défi nécessite une invitation" });
      }

      const participation =
        await this.challengeParticipationService.joinChallenge(
          challengeId,
          user._id!
        );

      if (!participation) {
        return res
          .status(400)
          .json({ error: "Impossible de rejoindre ce défi" });
      }

      res.status(201).json(participation);
    } catch (e: any) {
      res
        .status(500)
        .json({ error: e.message || "Erreur lors de l'inscription" });
    }
  }

  async leaveChallenge(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { challengeId } = req.params;

    try {
      const success = await this.challengeParticipationService.leaveChallenge(
        challengeId,
        user._id!
      );

      if (!success) {
        return res.status(400).json({ error: "Impossible de quitter ce défi" });
      }

      res.status(204).send();
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Erreur lors du départ" });
    }
  }

  async getChallengeParticipants(req: Request, res: Response) {
    const { challengeId } = req.params;

    try {
      const participants =
        await this.challengeParticipationService.getChallengeParticipants(
          challengeId
        );
      res.json(participants);
    } catch (e: any) {
      res.status(500).json({
        error: e.message || "Erreur lors de la récupération des participants",
      });
    }
  }

  async getChallengeStats(req: Request, res: Response) {
    const { challengeId } = req.params;

    try {
      const stats = await this.challengeParticipationService.getChallengeStats(
        challengeId
      );

      if (!stats) {
        return res.status(404).json({ error: "Défi non trouvé" });
      }

      res.json(stats);
    } catch (e: any) {
      res.status(500).json({
        error: e.message || "Erreur lors de la récupération des statistiques",
      });
    }
  }

  async getMyParticipations(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    try {
      const participations =
        await this.challengeParticipationService.getUserParticipations(
          user._id!
        );
      res.json(participations);
    } catch (e: any) {
      res.status(500).json({
        error: e.message || "Erreur lors de la récupération des participations",
      });
    }
  }

  async getMyInvitations(req: Request, res: Response) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    try {
      const invitations =
        await this.challengeParticipationService.getUserInvitations(user._id!);
      res.json(invitations);
    } catch (e: any) {
      res.status(500).json({
        error: e.message || "Erreur lors de la récupération des invitations",
      });
    }
  }

  buildRouter(): Router {
    const router = Router();
    router.use(sessionMiddleware(this.sessionService, this.userService));

    router.post("/", json(), requireRoleLevel(2), this.create.bind(this));
    router.get("/", requireRoleLevel(3), this.findAll.bind(this));
    router.get("/my/participations", this.getMyParticipations.bind(this));
    router.get("/my/invitations", this.getMyInvitations.bind(this));
    router.get("/gym/:gymId", this.findByGym.bind(this));
    router.get("/:id", this.findById.bind(this));
    router.get(
      "/:challengeId/participants",
      this.getChallengeParticipants.bind(this)
    );
    router.get("/:challengeId/stats", this.getChallengeStats.bind(this));

    router.post(
      "/:challengeId/invite",
      json(),
      this.inviteToChallenge.bind(this)
    );
    router.post("/:challengeId/join", this.joinChallenge.bind(this));
    router.post(
      "/invitations/:invitationId/accept",
      this.acceptInvitation.bind(this)
    );
    router.delete(
      "/invitations/:invitationId/decline",
      this.declineInvitation.bind(this)
    );
    router.delete("/:challengeId/leave", this.leaveChallenge.bind(this));

    router.patch("/:id", json(), requireRoleLevel(2), this.update.bind(this));
    router.delete("/:id", requireRoleLevel(2), this.delete.bind(this));

    return router;
  }
}
