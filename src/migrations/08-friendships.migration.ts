import { FriendshipService } from "../services/mongoose/services";
import { Friendship, FriendshipStatus, User } from "../models";

export async function seedFriendships(
  friendshipService: FriendshipService,
  users: User[]
): Promise<Friendship[]> {
  if (users.length < 4) {
    return [];
  }

  const friendshipsData = [
    {
      requesterEmail: "emily.davis@example.com",
      addresseeEmail: "alex.wilson@example.com",
      status: FriendshipStatus.ACCEPTED,
    },
    {
      requesterEmail: "alex.wilson@example.com",
      addresseeEmail: "sarah.brown@example.com",
      status: FriendshipStatus.ACCEPTED,
    },
    {
      requesterEmail: "emily.davis@example.com",
      addresseeEmail: "sarah.brown@example.com",
      status: FriendshipStatus.ACCEPTED,
    },
    {
      requesterEmail: "emily.davis@example.com",
      addresseeEmail: "jane.smith@example.com",
      status: FriendshipStatus.ACCEPTED,
    },
    {
      requesterEmail: "alex.wilson@example.com",
      addresseeEmail: "mike.johnson@example.com",
      status: FriendshipStatus.PENDING,
    },
    {
      requesterEmail: "jane.smith@example.com",
      addresseeEmail: "mike.johnson@example.com",
      status: FriendshipStatus.ACCEPTED,
    },
  ];

  const createdFriendships: Friendship[] = [];

  for (const friendshipData of friendshipsData) {
    try {
      const requester = users.find(
        (u) => u.email === friendshipData.requesterEmail
      );
      const addressee = users.find(
        (u) => u.email === friendshipData.addresseeEmail
      );

      if (!requester || !addressee) {
        continue;
      }

      const areFriends = await friendshipService.areFriends(
        requester._id!.toString(),
        addressee._id!.toString()
      );

      if (!areFriends) {
        const friendshipModel = (friendshipService as any).friendshipModel;
        const friendship = await friendshipModel.create({
          requesterId: requester._id!.toString(),
          addresseeId: addressee._id!.toString(),
          status: friendshipData.status,
        });

        if (friendship) {
          createdFriendships.push(friendship);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'amitié:", error);
    }
  }

  return createdFriendships;
}
