import { Schema, model } from "mongoose";

const LotterySchema = new Schema(
  {
    seriesNumber: {
      type: Number,
      required: true,
      unique: true
    },
    type: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    userPhoneNumber: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    secureData: {
      type: String,
      required: true
    },
    status: {
      type: String
    },
    tohirolId: {
      type: String,
      required: true
    },
    createdDate: {
      type: Number,
      default: Date.now(),
      index: -1
    }
  },
  {
    versionKey: false
  }
);

const LotteryModel = model("lottery", LotterySchema);
export default LotteryModel;
