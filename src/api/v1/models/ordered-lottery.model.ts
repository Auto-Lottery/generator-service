import { Schema, model } from "mongoose";

const OrderedLotterySchema = new Schema({
  lotteryNumber: {
    type: String,
    required: true,
    upperCase: true
  },
  secureData: {
    type: String,
    required: true
  },
  status: {
    type: String
  }
});

const OrderedLotteryModel = model("orderedLottery", OrderedLotterySchema);
export default OrderedLotteryModel;
