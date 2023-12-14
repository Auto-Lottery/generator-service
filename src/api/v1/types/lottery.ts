import { PackageType } from "./enums";

export type Lottery = {
  series: string;
  seriesNumber: number;
  type: PackageType;
  amount: number;
  secureData: string;
};
