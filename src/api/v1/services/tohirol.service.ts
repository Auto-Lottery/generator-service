import TohirolModel from "../models/tohirol.model";
import { CustomResponse } from "../types/custom-response";
import { Tohirol, TohirolInput } from "../types/tohirol";

export class TohirolService {
  constructor() {}

  async createTohirol(data: TohirolInput, userId: string) {
    const newTohirol = await TohirolModel.create({
      ...data,
      createdUser: userId
    });

    const tohirolJson = newTohirol.toJSON();

    return tohirolJson;
  }

  async getActiveTohirol(): Promise<CustomResponse<Tohirol>> {
    const tohirol = await TohirolModel.findOne({
      isActive: true
    });

    if (!tohirol) {
      return {
        code: 500,
        message: "Идэвхитэй тохирол олдсонгүй"
      };
    }

    const { _id, ...tohirolJson } = tohirol.toJSON();

    return {
      code: 200,
      data: { _id: _id.toString(), ...tohirolJson }
    };
  }

  async changeTohirolStatus(status: string) {
    TohirolModel.findOneAndUpdate(
      {
        isActive: true
      },
      {
        $set: {
          status: status
        }
      }
    );
  }
}
