import { ChallengeParticipationService } from "../services/mongoose/services";
import {
  ChallengeParticipation,
  ParticipationStatus,
  User,
  Challenge,
} from "../models";

export async function seedChallengeParticipations(
  challengeParticipationService: ChallengeParticipationService,
  users: User[],
  challenges: Challenge[]
): Promise<ChallengeParticipation[]> {
  if (users.length === 0 || challenges.length === 0) {
    return [];
  }

  const participationsData = [
    {
      userEmail: "emily.davis@example.com",
      challengeTitle: "Défi 30 Jours de Cardio",
      status: ParticipationStatus.JOINED,
      joinedAt: new Date("2024-12-01T10:00:00Z"),
    },
    {
      userEmail: "alex.wilson@example.com",
      challengeTitle: "Défi 30 Jours de Cardio",
      status: ParticipationStatus.COMPLETED,
      joinedAt: new Date("2024-11-15T14:30:00Z"),
      completedAt: new Date("2024-12-15T18:00:00Z"),
    },
    {
      userEmail: "sarah.brown@example.com",
      challengeTitle: "Challenge Force Brute",
      status: ParticipationStatus.JOINED,
      joinedAt: new Date("2024-12-10T09:15:00Z"),
    },
    {
      userEmail: "emily.davis@example.com",
      challengeTitle: "Défi Perte de Poids Saine",
      status: ParticipationStatus.JOINED,
      joinedAt: new Date("2024-12-05T16:20:00Z"),
    },
    {
      userEmail: "alex.wilson@example.com",
      challengeTitle: "Défi Consistance 21 Jours",
      status: ParticipationStatus.COMPLETED,
      joinedAt: new Date("2024-11-20T08:00:00Z"),
      completedAt: new Date("2024-12-11T20:00:00Z"),
    },
    {
      userEmail: "sarah.brown@example.com",
      challengeTitle: "Marathon de Yoga 108",
      status: ParticipationStatus.JOINED,
      joinedAt: new Date("2024-12-12T11:45:00Z"),
    },
    {
      userEmail: "jane.smith@example.com",
      challengeTitle: "Challenge Powerlifting Elite",
      status: ParticipationStatus.JOINED,
      joinedAt: new Date("2024-12-08T13:30:00Z"),
    },
    {
      userEmail: "mike.johnson@example.com",
      challengeTitle: "Défi Équilibre Vie-Sport",
      status: ParticipationStatus.JOINED,
      joinedAt: new Date("2024-12-03T15:10:00Z"),
    },
    {
      userEmail: "emily.davis@example.com",
      challengeTitle: "Challenge Endurance Ultime",
      status: ParticipationStatus.ABANDONED,
      joinedAt: new Date("2024-11-25T12:00:00Z"),
    },
    {
      userEmail: "sarah.brown@example.com",
      challengeTitle: "Défi Flexibilité Totale",
      status: ParticipationStatus.JOINED,
      joinedAt: new Date("2024-12-14T17:25:00Z"),
    },
  ];

  const createdParticipations: ChallengeParticipation[] = [];

  for (const participationData of participationsData) {
    try {
      const user = users.find((u) => u.email === participationData.userEmail);
      const challenge = challenges.find(
        (c) => c.title === participationData.challengeTitle
      );

      if (!user || !challenge) {
        continue;
      }

      const existingParticipations =
        await challengeParticipationService.getUserParticipations(
          user._id!.toString()
        );
      const existingParticipation = existingParticipations.find(
        (p: ChallengeParticipation) =>
          p.challengeId === challenge._id!.toString()
      );

      if (!existingParticipation) {
        const participationModel = (challengeParticipationService as any)
          .participationModel;
        const participation = await participationModel.create({
          userId: user._id!.toString(),
          challengeId: challenge._id!.toString(),
          status: participationData.status,
          joinedAt: participationData.joinedAt,
          completedAt: participationData.completedAt,
        });

        if (participation) {
          createdParticipations.push(participation);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de la participation:", error);
    }
  }

  return createdParticipations;
}
