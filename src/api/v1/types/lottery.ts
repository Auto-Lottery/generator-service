import { PackageType } from "./enums";

export type Lottery = {
  userId: string;
  userPhoneNumber: string;
  status?: string;
  seriesNumber: number;
  type: PackageType;
  amount: number;
  transactionId: string;
  createdDate?: number;
  secureData: string;
  tohirol: string;
};

export type LotteryWithNumber = {
  transactionId: string;
  lotteryNumber: string;
} & Omit<Lottery, "secureData">;
