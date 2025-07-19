export interface Exercise {
  _id?: string;
  name: string;
  description?: string;
  targetMuscles?: string[];
  level: "beginner" | "intermediate" | "advanced";
  type: "strength" | "cardio" | "flexibility" | "balance";
  isPublic: boolean;
  equipments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
