import { Request, Response, Router, json } from "express";
import { sessionMiddleware } from "../middlewares";
import {
  FriendshipService,
  SessionService,
  UserService,
} from "../services/mongoose/services";

export class FriendshipController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) {}

  async sendFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const { addresseeId } = req.body;
      if (!addresseeId) {
        res.status(400).json({ error: "ID du destinataire requis" });
        return;
      }

      const friendship = await this.friendshipService.sendFriendRequest(
        user._id,
        addresseeId
      );

      if (!friendship) {
        res
          .status(400)
          .json({ error: "Impossible d'envoyer la demande d'ami" });
        return;
      }

      res.status(201).json(friendship);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande d'ami:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async acceptFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const { id } = req.params;
      const friendship = await this.friendshipService.acceptFriendRequest(
        id,
        user._id
      );

      if (!friendship) {
        res.status(400).json({ error: "Impossible d'accepter cette demande" });
        return;
      }

      res.json(friendship);
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la demande:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async declineFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const { id } = req.params;
      const success = await this.friendshipService.declineFriendRequest(
        id,
        user._id
      );

      if (!success) {
        res.status(400).json({ error: "Impossible de refuser cette demande" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors du refus de la demande:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async removeFriend(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const { friendId } = req.params;
      const success = await this.friendshipService.removeFriend(
        user._id,
        friendId
      );

      if (!success) {
        res.status(400).json({ error: "Impossible de supprimer cet ami" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ami:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: "ID utilisateur requis" });
        return;
      }

      const friendship = await this.friendshipService.blockUser(
        user._id,
        userId
      );

      if (!friendship) {
        res
          .status(400)
          .json({ error: "Impossible de bloquer cet utilisateur" });
        return;
      }

      res.json(friendship);
    } catch (error) {
      console.error("Erreur lors du blocage de l'utilisateur:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async getFriends(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const friends = await this.friendshipService.getFriends(user._id);
      res.json(friends);
    } catch (error) {
      console.error("Erreur lors de la récupération des amis:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async getFriendRequests(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const requests = await this.friendshipService.getFriendRequests(user._id);
      res.json(requests);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async getSentRequests(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const requests = await this.friendshipService.getSentRequests(user._id);
      res.json(requests);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des demandes envoyées:",
        error
      );
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Non authentifié" });
        return;
      }

      const { q, limit = 10 } = req.query;
      if (!q || typeof q !== "string") {
        res.status(400).json({ error: "Paramètre de recherche requis" });
        return;
      }

      const users = await this.friendshipService.searchUsers(
        q,
        user._id,
        parseInt(limit as string)
      );
      res.json(users);
    } catch (error) {
      console.error("Erreur lors de la recherche d'utilisateurs:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.use(sessionMiddleware(this.sessionService, this.userService));

    router.post("/request", json(), this.sendFriendRequest.bind(this));
    router.post("/accept/:id", this.acceptFriendRequest.bind(this));
    router.delete("/decline/:id", this.declineFriendRequest.bind(this));
    router.delete("/remove/:friendId", this.removeFriend.bind(this));
    router.post("/block", json(), this.blockUser.bind(this));

    router.get("/", this.getFriends.bind(this));
    router.get("/requests", this.getFriendRequests.bind(this));
    router.get("/sent", this.getSentRequests.bind(this));
    router.get("/search", this.searchUsers.bind(this));

    return router;
  }
}
