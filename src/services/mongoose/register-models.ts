import { Mongoose } from "mongoose";
import { userSchema } from "./schema/user.schema";
import { sessionSchema } from "./schema/session.schema";
import { gymSchema } from "./schema/gym.schema";
import { exerciseSchema } from "./schema/exercise.schema";
import { equipmentSchema } from "./schema/equipment.schema";
import { challengeSchema } from "./schema/challenge.schema";

export function registerAllModels(connection: Mongoose) {
    if (!connection.models.User) {
    connection.model("User", userSchema());
  }

  if (!connection.models.Session) {
    connection.model("Session", sessionSchema());
  }

  if (!connection.models.Gym) {
    connection.model("Gym", gymSchema());
  }

  if (!connection.models.Exercise) {
    connection.model("Exercise", exerciseSchema());
  }

  if (!connection.models.Equipment) {
    connection.model("Equipment", equipmentSchema());
  }

  if (!connection.models.Challenge) {
    connection.model("Challenge", challengeSchema());
  }
}
