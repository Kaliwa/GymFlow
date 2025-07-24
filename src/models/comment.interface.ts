export interface ChallengeComment {
  _id?: string;
  challengeId: string;
  userId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
} 