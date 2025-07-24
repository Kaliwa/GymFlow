import { ChallengeService } from "../services/mongoose/services";
import { Challenge, Gym, ChallengeType } from "../models";

export async function seedChallenges(
  challengeService: ChallengeService,
  createdBy: string,
  gyms: Gym[]
): Promise<Challenge[]> {
  if (gyms.length === 0) {
    return [];
  }

  const challengesData = [
    {
      title: "Défi 30 Jours de Cardio",
      description:
        "Effectuez au moins 30 minutes de cardio pendant 30 jours consécutifs pour améliorer votre endurance cardiovasculaire",
      gym: gyms[0]._id,
      createdBy: createdBy,
      difficulty: "medium" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
    {
      title: "Challenge Force Brute",
      description:
        "Développé couché : atteignez 1.5x votre poids de corps et rejoignez l'élite de la force",
      gym: gyms[1]?._id || gyms[0]._id,
      createdBy: createdBy,
      difficulty: "hard" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
    {
      title: "Défi Team CrossFit",
      description:
        "Équipes de 4 : complétez ensemble 1000 burpees en un mois et renforcez l'esprit d'équipe",
      gym: gyms[2]?._id || gyms[0]._id,
      createdBy: createdBy,
      difficulty: "hard" as const,
      type: ChallengeType.TEAM,
      maxParticipants: 4,
      isPrivate: false,
      requiresInvitation: true,
      isActive: true,
    },
    {
      title: "Défi Perte de Poids Saine",
      description:
        "Perdez 5kg en 3 mois de manière saine et durable avec un suivi personnalisé",
      gym: gyms[0]._id,
      createdBy: createdBy,
      difficulty: "medium" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
    {
      title: "Marathon de Yoga 108",
      description:
        "Pratiquez le yoga 108 fois en 4 mois - un nombre sacré pour une transformation spirituelle",
      gym: gyms[3]?._id || "",
      createdBy: createdBy,
      difficulty: "medium" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
    {
      title: "Défi Consistance 21 Jours",
      description:
        "Ne ratez aucun entraînement pendant 21 jours et créez une habitude durable",
      gym: gyms[0]?._id || "",
      createdBy: createdBy,
      difficulty: "easy" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
    {
      title: "Challenge Powerlifting Elite",
      description:
        "Atteignez un total de 500kg sur les 3 mouvements de powerlifting et entrez dans l'élite",
      gym: gyms[1]?._id || "",
      createdBy: createdBy,
      difficulty: "hard" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
    {
      title: "Défi Équilibre Vie-Sport",
      description:
        "Maintenez 4 workouts par semaine pendant 2 mois pour un parfait équilibre vie-sport",
      gym: gyms[0]?._id || "",
      createdBy: createdBy,
      difficulty: "medium" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
    {
      title: "Challenge Endurance Ultime",
      description:
        "Courez un semi-marathon en moins de 2h ou améliorez votre record personnel",
      gym: gyms[0]?._id || "",
      createdBy: createdBy,
      difficulty: "hard" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
    {
      title: "Défi Flexibilité Totale",
      description:
        "Atteignez le grand écart en 60 jours avec un programme de stretching progressif",
      gym: gyms[3]?._id || "",
      createdBy: createdBy,
      difficulty: "medium" as const,
      type: ChallengeType.INDIVIDUAL,
      isPrivate: false,
      requiresInvitation: false,
      isActive: true,
    },
  ];

  const createdChallenges: Challenge[] = [];

  for (const challengeData of challengesData) {
    try {
      const allChallenges = await challengeService.findAllChallenges();
      const existingChallenge = allChallenges.find(
        (c: Challenge) => c.title === challengeData.title
      );

      if (!existingChallenge) {
        const challenge = await challengeService.createChallenge(challengeData);
        createdChallenges.push(challenge);
      } else {
        createdChallenges.push(existingChallenge);
      }
    } catch (error) {
      console.error(`  ❌ Erreur création défi ${challengeData.title}:`, error);
    }
  }

  return createdChallenges;
}
