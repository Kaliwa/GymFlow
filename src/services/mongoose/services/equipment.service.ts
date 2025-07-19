import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Equipment } from "../../../models";
import { equipmentSchema } from "../schema/equipment.schema";

export class EquipmentService {
  readonly equipmentModel: Model<Equipment>;

  constructor(public readonly _connection: Mongoose) {
    try {
      this.equipmentModel = _connection.model<Equipment>("Equipment");
    } catch (_error) {
      console.error(_error);
      this.equipmentModel = _connection.model("Equipment", equipmentSchema());
    }
  }

  async findAll(): Promise<Equipment[]> {
    return this.equipmentModel.find();
  }

  async findById(id: string): Promise<Equipment | null> {
    if (!isValidObjectId(id)) return null;
    return this.equipmentModel.findById(id);
  }

  async create(data: Partial<Equipment>): Promise<Equipment> {
    return this.equipmentModel.create(data);
  }

  async update(id: string, data: Partial<Equipment>): Promise<Equipment | null> {
    if (!isValidObjectId(id)) return null;
    return this.equipmentModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const res = await this.equipmentModel.findByIdAndDelete(id);
    return !!res;
  }
}
