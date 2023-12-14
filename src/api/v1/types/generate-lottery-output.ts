import { Lottery } from "./lottery";
import { OrderedLottery } from "./ordered-lottery";

export type GenerateLotteryOutput = {
  orderedLotteryList: OrderedLottery[];
  lotteryList: Lottery[];
  lastSeriesNumber: number;
};
