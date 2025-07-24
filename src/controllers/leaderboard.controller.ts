import { Request, Response, Router } from "express";
import { UserService, WorkoutService, ChallengeService, SessionService } from "../services/mongoose/services";
import { sessionMiddleware } from "../middlewares";

export class LeaderboardController {
  constructor(
    private readonly userService: UserService,
    private readonly workoutService: WorkoutService,
    private readonly challengeService: ChallengeService,
    private readonly sessionService: SessionService
  ) {}

  async globalLeaderboard(req: Request, res: Response) {
    const workoutCounts = await this.workoutService.getUserWorkoutCounts();
    const challengeCounts = await this.challengeService.getUserChallengeCounts();
    const userScores: Record<string, { userId: string, score: number }> = {};
    for (const { userId, count } of workoutCounts) {
      userScores[userId] = { userId, score: count };
    }
    for (const { userId, count } of challengeCounts) {
      if (userScores[userId]) {
        userScores[userId].score += count;
      } else {
        userScores[userId] = { userId, score: count };
      }
    }
    const leaderboard = Object.values(userScores).sort((a, b) => b.score - a.score).slice(0, 50);
    const users = await this.userService.findUsersByIds(leaderboard.map(u => u.userId));
    const leaderboardWithUsers = leaderboard.map(entry => ({
      ...entry,
      user: users.find(u => u._id.toString() === entry.userId)
    }));
    res.json(leaderboardWithUsers);
  }

  buildRouter(): Router {
    const router = Router();
    router.get("/global", sessionMiddleware(this.sessionService, this.userService), this.globalLeaderboard.bind(this));
    return router;
  }
} 