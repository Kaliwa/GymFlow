import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Exercise } from "../../../models";
import { exerciseSchema } from "../schema/exercise.schema";

export class ExerciseService {
  readonly exerciseModel: Model<Exercise>;

  constructor(public readonly _connection: Mongoose) {
    try {
      this.exerciseModel = _connection.model<Exercise>("Exercise");
    } catch (_error) {
      console.error(_error);
      this.exerciseModel = _connection.model("Exercise", exerciseSchema());
    }
  }

  async findAll(isAdmin: boolean = false): Promise<Exercise[]> {
    if (isAdmin) {
      return this.exerciseModel.find();
    }
    return this.exerciseModel.find({ isPublic: true });
  }

  async findById(id: string, isAdmin: boolean = false): Promise<Exercise | null> {
    if (!isValidObjectId(id)) return null;
    if (isAdmin) {
      return this.exerciseModel.findById(id);
    }
    return this.exerciseModel.findOne({ _id: id, isPublic: true });
  }

  async create(data: Partial<Exercise>): Promise<Exercise> {
    return this.exerciseModel.create(data);
  }

  async update(id: string, data: Partial<Exercise>): Promise<Exercise | null> {
    if (!isValidObjectId(id)) return null;
    return this.exerciseModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const res = await this.exerciseModel.findByIdAndDelete(id);
    return !!res;
  }
}
