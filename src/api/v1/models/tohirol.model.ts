import { Schema, model } from "mongoose";

const TohirolSchema = new Schema(
  {
    tohirolNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    totalTicket: {
      type: Number,
      required: true
    },
    gift: {
      type: String
    },
    status: {
      type: String,
      default: "STARTED",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdUser: {
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

const TohirolModel = model("tohirol", TohirolSchema);
export default TohirolModel;
