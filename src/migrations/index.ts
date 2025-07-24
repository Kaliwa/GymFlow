import {
  UserService,
  GymService,
  ExerciseService,
  EquipmentService,
  ChallengeService,
  BadgeService,
  WorkoutService,
  FriendshipService,
  ChallengeParticipationService,
} from "../services/mongoose/services";

import { User } from "../models";
import { seedUsers } from "./01-users.migration";
import { seedGyms } from "./02-gyms.migration";
import { seedEquipments } from "./03-equipments.migration";
import { seedExercises } from "./04-exercises.migration";
import { seedChallenges } from "./05-challenges.migration";
import { seedBadges } from "./06-badges.migration";
import { seedWorkouts } from "./07-workouts.migration";
import { seedFriendships } from "./08-friendships.migration";
import { seedChallengeParticipations } from "./09-challenge-participations.migration";
import { seedChallengeInvitations } from "./10-challenge-invitations.migration";

export interface MigrationServices {
  userService: UserService;
  gymService: GymService;
  exerciseService: ExerciseService;
  equipmentService: EquipmentService;
  challengeService: ChallengeService;
  badgeService: BadgeService;
  workoutService: WorkoutService;
  friendshipService: FriendshipService;
  challengeParticipationService: ChallengeParticipationService;
}

export async function runMigrations(
  services: MigrationServices
): Promise<void> {
  try {
    const users = await seedUsers(services.userService);
    if (users.length === 0) throw new Error("Aucun utilisateur créé");

    const adminUser = users.find((u: User) => u.role === "SUPER_ADMIN");
    if (!adminUser?._id)
      throw new Error("Admin user not found for gym creation");

    const gyms = await seedGyms(services.gymService, adminUser._id.toString());
    if (gyms.length === 0) throw new Error("Aucune gym créée");

    const equipments = await seedEquipments(services.equipmentService, gyms);
    if (equipments.length === 0) throw new Error("Aucun équipement créé");

    const exercises = await seedExercises(services.exerciseService, equipments);
    if (exercises.length === 0) throw new Error("Aucun exercice créé");

    const challenges = await seedChallenges(
      services.challengeService,
      adminUser._id.toString(),
      gyms
    );

    const badges = await seedBadges(
      services.badgeService,
      adminUser._id.toString()
    );
    if (badges.length === 0) throw new Error("Aucun badge créé");

    const workouts = await seedWorkouts(
      services.workoutService,
      users,
      exercises,
      gyms,
      challenges
    );
    if (workouts.length === 0) throw new Error("Aucun workout créé");

    const friendships = await seedFriendships(
      services.friendshipService,
      users
    );
    if (friendships.length === 0) throw new Error("Aucune amitié créée");

    const challengeParticipations = await seedChallengeParticipations(
      services.challengeParticipationService,
      users,
      challenges
    );
    if (challengeParticipations.length === 0)
      throw new Error("Aucune participation au défi créée");

    const challengeInvitations = await seedChallengeInvitations(
      services.challengeParticipationService,
      users,
      challenges
    );
    if (challengeInvitations.length === 0)
      throw new Error("Aucune invitation au défi créée");
  } catch (error) {
    console.error("❌ Erreur lors des migrations:", error);
    throw error;
  }
}
