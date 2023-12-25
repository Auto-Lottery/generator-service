import { Schema, model } from "mongoose";

const OrderedLotterySchema = new Schema(
  {
    lotteryNumber: {
      type: String,
      required: true,
      upperCase: true,
      unique: true
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

const OrderedLotteryModel = model("orderedLottery", OrderedLotterySchema);
export default OrderedLotteryModel;
