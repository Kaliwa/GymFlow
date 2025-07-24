import { ChallengeParticipationService } from "../services/mongoose/services";
import { ChallengeInvitation, User, Challenge } from "../models";

export async function seedChallengeInvitations(
  challengeParticipationService: ChallengeParticipationService,
  users: User[],
  challenges: Challenge[]
): Promise<ChallengeInvitation[]> {
  if (users.length === 0 || challenges.length === 0) {
    return [];
  }

  const invitationsData = [
    {
      inviterEmail: "jane.smith@example.com",
      inviteeEmail: "emily.davis@example.com",
      challengeTitle: "Défi Team CrossFit",
      message:
        "Rejoins notre équipe pour ce défi CrossFit ! On va s'éclater ensemble 💪",
      status: "PENDING" as const,
    },
    {
      inviterEmail: "mike.johnson@example.com",
      inviteeEmail: "alex.wilson@example.com",
      challengeTitle: "Défi Team CrossFit",
      message: "Salut Alex ! Tu veux participer à notre défi d'équipe ?",
      status: "ACCEPTED" as const,
      respondedAt: new Date("2024-12-13T14:20:00Z"),
    },
    {
      inviterEmail: "jane.smith@example.com",
      inviteeEmail: "sarah.brown@example.com",
      challengeTitle: "Défi Team CrossFit",
      message: "Sarah, on a besoin de toi dans l'équipe !",
      status: "ACCEPTED" as const,
      respondedAt: new Date("2024-12-12T16:45:00Z"),
    },
    {
      inviterEmail: "emily.davis@example.com",
      inviteeEmail: "alex.wilson@example.com",
      challengeTitle: "Marathon de Yoga 108",
      message: "Alex, ça te dit de faire ce défi yoga ensemble ? 🧘‍♀️",
      status: "PENDING" as const,
    },
    {
      inviterEmail: "jane.smith@example.com",
      inviteeEmail: "mike.johnson@example.com",
      challengeTitle: "Challenge Powerlifting Elite",
      message: "Mike, tu es parfait pour ce défi de powerlifting !",
      status: "DECLINED" as const,
      respondedAt: new Date("2024-12-10T11:30:00Z"),
    },
    {
      inviterEmail: "sarah.brown@example.com",
      inviteeEmail: "emily.davis@example.com",
      challengeTitle: "Défi Flexibilité Totale",
      message: "Emily, on se motive mutuellement pour ce défi souplesse ?",
      status: "PENDING" as const,
    },
    {
      inviterEmail: "alex.wilson@example.com",
      inviteeEmail: "sarah.brown@example.com",
      challengeTitle: "Challenge Endurance Ultime",
      message: "Sarah, prête pour un défi running intense ? 🏃‍♀️",
      status: "ACCEPTED" as const,
      respondedAt: new Date("2024-12-09T09:15:00Z"),
    },
    {
      inviterEmail: "mike.johnson@example.com",
      inviteeEmail: "jane.smith@example.com",
      challengeTitle: "Défi Équilibre Vie-Sport",
      message: "Jane, ce défi correspond parfaitement à ton style de vie !",
      status: "PENDING" as const,
    },
  ];

  const createdInvitations: ChallengeInvitation[] = [];

  for (const invitationData of invitationsData) {
    try {
      const inviter = users.find(
        (u) => u.email === invitationData.inviterEmail
      );
      const invitee = users.find(
        (u) => u.email === invitationData.inviteeEmail
      );
      const challenge = challenges.find(
        (c) => c.title === invitationData.challengeTitle
      );

      if (!inviter || !invitee || !challenge) {
        continue;
      }

      const challengeInvitationModel = (
        challengeParticipationService as any
      )._connection.model("ChallengeInvitation");

      const existingInvitation = await challengeInvitationModel.findOne({
        challengeId: challenge._id!.toString(),
        inviterId: inviter._id!.toString(),
        inviteeId: invitee._id!.toString(),
      });

      if (!existingInvitation) {
        const invitation = await challengeInvitationModel.create({
          challengeId: challenge._id!.toString(),
          inviterId: inviter._id!.toString(),
          inviteeId: invitee._id!.toString(),
          message: invitationData.message,
          status: invitationData.status,
          respondedAt: invitationData.respondedAt,
        });

        if (invitation) {
          createdInvitations.push(invitation);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);
    }
  }

  return createdInvitations;
}
