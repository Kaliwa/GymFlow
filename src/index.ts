import express from "express";
import { config } from "dotenv";
import { UserRole } from "./models";
import { GymController } from "./controllers/gym.controller";
import { AuthController } from "./controllers/auth.controller";
import { ExerciseController } from "./controllers/exercise.controller";
import { registerAllModels } from "./services/mongoose/register-models";
import { EquipmentController } from "./controllers/equipment.controller";
import { openConnection } from "./services/mongoose/utils/mongoose-connect.utils";
import {
  EquipmentService,
  SessionService,
  UserService,
  GymService,
  ExerciseService,
  ChallengeService,
  BadgeService,
  WorkoutService,
  FriendshipService,
  ChallengeParticipationService,
  ChallengeCommentService
} from "./services/mongoose/services";
import { ChallengeController } from "./controllers/challenge.controller";
import { BadgeController } from "./controllers/badge.controller";
import { WorkoutController } from "./controllers/workout.controller";
import { FriendshipController } from "./controllers/friendship.controller";
import { ChallengeCommentController } from "./controllers/challenge-comment.controller";
import { runMigrations } from "./migrations";
import { LeaderboardController } from "./controllers/leaderboard.controller";

config();

async function startServer() {
  const connection = await openConnection();
  registerAllModels(connection);

  const userService = new UserService(connection);
  const sessionService = new SessionService(connection);
  const exerciseService = new ExerciseService(connection);
  const gymService = new GymService(connection);
  const equipmentService = new EquipmentService(connection);
  const challengeService = new ChallengeService(connection);
  const badgeService = new BadgeService(connection);
  const workoutService = new WorkoutService(connection);
  const friendshipService = new FriendshipService(connection);
  const challengeParticipationService = new ChallengeParticipationService(
    connection
  );
  const challengeCommentService = new ChallengeCommentService(connection);

  const rootUser = await bootstrapAPI(userService);

  if (rootUser) {
    await runMigrations({
      userService,
      gymService,
      exerciseService,
      equipmentService,
      challengeService,
      badgeService,
      workoutService,
      friendshipService,
      challengeParticipationService,
    });
  }

  const app = express();
  const authController = new AuthController(userService, sessionService);
  const gymController = new GymController(
    gymService,
    sessionService,
    userService
  );
  const exerciseController = new ExerciseController(
    exerciseService,
    gymService,
    sessionService,
    userService
  );
  const equipmentController = new EquipmentController(
    equipmentService,
    sessionService,
    userService
  );
  const challengeController = new ChallengeController(
    challengeService,
    challengeParticipationService,
    friendshipService,
    sessionService,
    userService
  );
  const badgeController = new BadgeController(
    badgeService,
    workoutService,
    sessionService,
    userService
  );
  const workoutController = new WorkoutController(
    workoutService,
    badgeService,
    sessionService,
    userService
  );
  const friendshipController = new FriendshipController(
    friendshipService,
    sessionService,
    userService
  );
  
  const challengeCommentController = new ChallengeCommentController(challengeCommentService, sessionService, userService);
  const leaderboardController = new LeaderboardController(userService, workoutService, challengeService, sessionService);

  app.use("/auth", authController.buildRouter());
  app.use("/gyms", gymController.buildRouter());
  app.use("/exercises", exerciseController.buildRouter());
  app.use("/equipments", equipmentController.buildRouter());
  app.use("/challenges", challengeController.buildRouter());
  app.use("/badges", badgeController.buildRouter());
  app.use("/workouts", workoutController.buildRouter());
  app.use("/friends", friendshipController.buildRouter());
  app.use("/challenge-comments", challengeCommentController.buildRouter());
  app.use("/leaderboard", leaderboardController.buildRouter());
  
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}

async function bootstrapAPI(userService: UserService) {
  if (typeof process.env.GYMFLOW_ROOT_EMAIL === "undefined") {
    throw new Error("GYMFLOW_ROOT_EMAIL is not defined");
  }

  if (typeof process.env.GYMFLOW_ROOT_PASSWORD === "undefined") {
    throw new Error("GYMFLOW_ROOT_PASSWORD is not defined");
  }

  const rootUser = await userService.findUser(process.env.GYMFLOW_ROOT_EMAIL);

  if (!rootUser) {
    const newRootUser = await userService.createUser({
      firstName: "root",
      lastName: "root",
      password: process.env.GYMFLOW_ROOT_PASSWORD,
      email: process.env.GYMFLOW_ROOT_EMAIL,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });
    return newRootUser;
  }

  return rootUser;
}

startServer()
  .then(() => {
    console.log("API bootstrapped successfully.");
  })
  .catch((_error) => {
    console.error("Error bootstrapping API:", _error);
    process.exit(1);
  });
