import { Schema } from "mongoose";
import { Equipment } from "../../../models/equipment.interface";

export function equipmentSchema(): Schema<Equipment> {
  return new Schema<Equipment>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
  }, {
    timestamps: true,
    collection: "equipments"
  });
}
