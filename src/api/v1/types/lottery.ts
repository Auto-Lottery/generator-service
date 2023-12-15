import { PackageType } from "./enums";

export type Lottery = {
  series: string;
  userId: string;
  userPhoneNumber: string;
  status?: string;
  seriesNumber: number;
  type: PackageType;
  amount: number;
  createdDate?: Date;
  secureData: string;
};

export type LotteryWithNumber = {
  transactionId: string;
  lotteryNumber: string;
} & Omit<Lottery, "secureData">;
