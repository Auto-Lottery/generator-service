import { Schema, model } from "mongoose";

const LotterySchema = new Schema({
  series: {
    type: String,
    required: true,
    upperCase: true,
    unique: true
  },
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
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const LotteryModel = model("lottery", LotterySchema);
export default LotteryModel;
