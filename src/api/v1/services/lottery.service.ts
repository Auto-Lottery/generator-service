import LotteryModel from "../models/lottery.model";
import OrderedLotteryModel from "../models/ordered-lottery.model";
import { CreateQueueInput } from "../types/create-queue-input";
import { PackageType } from "../types/enums";
import { GenerateLotteryInput } from "../types/generate-lottery-input";
import { GenerateLotteryOutput } from "../types/generate-lottery-output";
import { Lottery } from "../types/lottery";
import { OrderedLottery } from "../types/ordered-lottery";
import { PackageInfo } from "../types/package-info";
import { KeyPair } from "../types/secret";
import { encryptData, generateRandom8DigitNumber } from "../utilities";
import { RedisManager } from "./redis-manager";
import VaultManager from "./vautl-manager";

export class LotteryService {
  constructor() {}

  private getPackageFromAmount(amount: number): PackageInfo {
    switch (amount) {
      case 50000:
        return {
          type: PackageType.PACKAGE_2,
          count: 3,
          amount
        };
      case 100000:
        return {
          type: PackageType.PACKAGE_3,
          count: 6,
          amount
        };
      default:
        return {
          type: PackageType.PACKAGE_1,
          count: Math.floor(amount / 20000),
          amount
        };
    }
  }

  // Сугалааны дарааллын сүүлийн дугаар
  async getLastSeriesNumber(): Promise<number> {
    const redisManager = RedisManager.getInstance();
    const value = await redisManager.getClient()?.GET("SERIES");
    // Database-s haina
    if (!value) {
      const res = await LotteryModel.aggregate([
        { $group: { _id: null, lastSeriesNumber: { $max: "$seriesNumber" } } },
        { $project: { _id: 0, lastSeriesNumber: 1 } }
      ]);
      if (res.length > 0) {
        return res[0]?.lastSeriesNumber;
      }
      return 0;
    }
    return Number(value);
  }

  async updateLastSeriesNumber(series: number) {
    const redisManager = RedisManager.getInstance();
    await redisManager.getClient()?.SET("SERIES", series);
  }

  async generateLotteryNumber(count: number): Promise<string[]> {
    const numbers = Array(count)
      .fill(0)
      .map(() => generateRandom8DigitNumber().toString());

    // check exist
    const result = await OrderedLotteryModel.find({
      lotteryNumber: { $in: numbers }
    });

    if (!result || result.length === 0) {
      return numbers;
    }
    const duplicatedNumbers = result.map((doc) => doc.lotteryNumber);

    // Used lottery number
    const uniqueNumber = numbers.filter(
      (num: string) => !duplicatedNumbers.includes(num)
    );

    const otherNumbers = await this.generateLotteryNumber(
      count - uniqueNumber.length
    );

    return uniqueNumber.concat(otherNumbers);
  }

  seriesFormatter(seriesNumber: number, length: number): string {
    // Session-tei hiiwel prefix nemne
    return seriesNumber.toString().padStart(length, "0");
  }

  async generateLottery({
    transactionId,
    packageInfo,
    systemKeyPair,
    userKeyPair,
    user
  }: GenerateLotteryInput): Promise<GenerateLotteryOutput> {
    const lastSeriesNumber = await this.getLastSeriesNumber();
    const lotteryNumbers = await this.generateLotteryNumber(packageInfo.count);
    const orderedLotteryList: OrderedLottery[] = [];
    const lotteryList: Lottery[] = [];

    let newSeriesNumber = lastSeriesNumber;
    lotteryNumbers.forEach((lNum) => {
      newSeriesNumber += 1;
      const newSeries = this.seriesFormatter(newSeriesNumber, 5);
      const lotteryData = {
        series: newSeries,
        seriesNumber: newSeriesNumber,
        userId: user._id,
        userPhoneNumber: user.phoneNumber,
        type: packageInfo.type,
        amount: packageInfo.amount
      };

      const lotterySecureData = {
        series: newSeries,
        type: packageInfo.type,
        transactionId: transactionId,
        lotteryNumber: lNum
      };

      const userSecureData = {
        id: user._id,
        phoneNumber: user.phoneNumber,
        operator: user.operator
      };

      const encryptedSecureData = encryptData(
        JSON.stringify(lotterySecureData),
        userKeyPair.publicKey
      );

      const encryptedUserSecureData = encryptData(
        JSON.stringify(userSecureData),
        systemKeyPair.publicKey
      );

      orderedLotteryList.push({
        lotteryNumber: lNum,
        secureData: encryptedUserSecureData,
        status: "ACTIVE"
      });
      lotteryList.push({ ...lotteryData, secureData: encryptedSecureData });
    });

    return {
      orderedLotteryList,
      lotteryList,
      lastSeriesNumber: newSeriesNumber
    };
  }

  async createLotteryNumbers(data: CreateQueueInput): Promise<{
    result: boolean;
    message?: string;
  }> {
    try {
      const packageInfo = this.getPackageFromAmount(data.transaction.amount);

      const vaultManager = VaultManager.getInstance();

      const systemSecret = (await vaultManager.read(
        "secret/data/systemSecret"
      )) as KeyPair;

      const userSecret = (await vaultManager.read(
        `secret/data/${data.user._id}`
      )) as KeyPair;

      // Lottery датаг үүсгэнэ
      const response = await this.generateLottery({
        transactionId: data.transaction.id,
        packageInfo,
        user: data.user,
        systemKeyPair: systemSecret,
        userKeyPair: userSecret
      });

      await OrderedLotteryModel.insertMany(response.orderedLotteryList);
      await LotteryModel.insertMany(response.lotteryList);
      await this.updateLastSeriesNumber(response.lastSeriesNumber);
      return {
        result: true
      };
    } catch (err) {
      if (err instanceof Error) {
        return {
          result: false,
          message: `${err.name} - ${err.message}`
        };
      }
      console.log("CREATE LOTTERY ERROR ", err);
      return {
        result: false,
        message: "CREATE LOTTERY ERROR "
      };
    }
  }
}
