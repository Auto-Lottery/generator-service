import { Schema, model } from "mongoose";
import { seriesFormatter } from "../utilities";

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
    transactionId: {
      type: String
    },
    tohirol: { type: Schema.Types.ObjectId, ref: "tohirol" },
    createdDate: {
      type: Number,
      default: Date.now(),
      index: -1
    }
  },
  {
    versionKey: false,
    virtuals: {
      seriesNumberStr: {
        get() {
          return seriesFormatter(this.seriesNumber, 6);
        }
      }
    },
    toJSON: {
      virtuals: false
    }
  }
);

const LotteryModel = model("lottery", LotterySchema);
export default LotteryModel;
