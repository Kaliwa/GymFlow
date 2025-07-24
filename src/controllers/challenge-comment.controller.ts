import { Request, Response, Router, json } from "express";
import { ChallengeCommentService, SessionService, UserService } from "../services/mongoose/services";
import { sessionMiddleware } from "../middlewares";

export class ChallengeCommentController {
  constructor(
    private readonly commentService: ChallengeCommentService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) {}

  async create(req: Request, res: Response) {
    const user = req.user;
    const { challengeId, content } = req.body;
    if (!user || !challengeId || !content) {
      return res.status(400).json({ error: "challengeId et content requis" });
    }
    const comment = await this.commentService.createComment({
      challengeId,
      userId: user._id,
      content
    });
    res.status(201).json(comment);
  }

  async list(req: Request, res: Response) {
    const { challengeId } = req.query;
    if (!challengeId || typeof challengeId !== "string") {
      return res.status(400).json({ error: "challengeId requis" });
    }
    const comments = await this.commentService.getCommentsByChallenge(challengeId);
    res.json(comments);
  }

  async remove(req: Request, res: Response) {
    const user = req.user;
    const { id } = req.params;
    if (!user || !id) {
      return res.status(400).json({ error: "id requis" });
    }
    await this.commentService.deleteComment(id, user._id);
    res.status(204).send();
  }

  buildRouter(): Router {
    const router = Router();
    router.use(sessionMiddleware(this.sessionService, this.userService));
    router.post("/", json(), this.create.bind(this));
    router.get("/", this.list.bind(this));
    router.delete("/:id", this.remove.bind(this));
    return router;
  }
} 