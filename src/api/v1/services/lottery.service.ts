import mongoose from "mongoose";
import LotteryModel from "../models/lottery.model";
import OrderedLotteryModel from "../models/ordered-lottery.model";
import { CreateQueueInput, CreateQueueOutput } from "../types/create-queue";
import { PackageType, TohirolStatus } from "../types/enums";
import { GenerateLotteryInput } from "../types/generate-lottery-input";
import { GenerateLotteryOutput } from "../types/generate-lottery-output";
import { Lottery, LotteryWithNumber } from "../types/lottery";
import { OrderedLottery } from "../types/ordered-lottery";
import { PackageInfo } from "../types/package-info";
import { KeyPair } from "../types/secret";
import { User } from "../types/user";
import {
  decryptData,
  encryptData,
  generateRandom6DigitNumber,
  getLotterySmsBody
} from "../utilities";
import { errorLog } from "../utilities/log";
import { RedisManager } from "./redis-manager";
import VaultManager from "./vault-manager";
import { TohirolService } from "./tohirol.service";
import { Filter, generateQuery } from "../utilities/mongo";
import { SmsService } from "./sms.service";

export class LotteryService {
  tohirolService: TohirolService;
  smsService: SmsService;
  constructor() {
    this.tohirolService = new TohirolService();
    this.smsService = new SmsService();
  }

  async getLotteryList(filter: Filter) {
    try {
      const { field, order } = filter?.sort || {
        field: "_id",
        order: "desc"
      };
      const { page, pageSize } = filter?.pagination || {
        page: 1,
        pageSize: 10
      };
      const skip = (page - 1) * pageSize;
      const query = generateQuery(filter?.conditions || []);

      const orders = await OrderedLotteryModel.find(query)
        .skip(skip)
        .limit(pageSize)
        .sort({
          [field]: order === "desc" ? -1 : 1
        })
        .populate("tohirol");

      const total = await OrderedLotteryModel.countDocuments(query);
      return {
        lotteryList: orders,
        total
      };
    } catch (error) {
      errorLog("Error fetching order ", error);
      throw new Error(`Error fetching order`);
    }
  }

  async getUserLotteryList(filter: Filter) {
    try {
      const { field, order } = filter?.sort || {
        field: "_id",
        order: "desc"
      };
      const { page, pageSize } = filter?.pagination || {
        page: 1,
        pageSize: 10
      };
      const skip = (page - 1) * pageSize;
      const query = generateQuery(filter?.conditions || []);

      const lotteryList = await LotteryModel.find(query)
        .skip(skip)
        .limit(pageSize)
        .sort({
          [field]: order === "desc" ? -1 : 1
        })
        .populate("tohirol");

      const total = await LotteryModel.countDocuments(query);
      return {
        userLotteryList: lotteryList.map((item) =>
          item.toJSON({ virtuals: true })
        ),
        total
      };
    } catch (error) {
      errorLog("Error fetching order ", error);
      throw new Error(`Error fetching order`);
    }
  }

  private getPackageFromAmount(amount: number): PackageInfo {
    switch (amount) {
      case 50000:
        return {
          type: PackageType.PACKAGE_1,
          count: 5,
          amount
        };
      default:
        return {
          type: PackageType.PACKAGE_1,
          count: Math.floor(amount / 50000) * 5,
          amount,
          change: amount % 50000
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

  async generateLotteryNumber(
    count: number,
    tohirolId: string
  ): Promise<string[]> {
    const numbers = Array(count)
      .fill(0)
      .map(() => generateRandom6DigitNumber().toString());

    // check exist
    const result = await OrderedLotteryModel.find({
      tohirol: tohirolId,
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
      count - uniqueNumber.length,
      tohirolId
    );

    return uniqueNumber.concat(otherNumbers);
  }

  async generateLottery({
    tohirol,
    transactionId,
    packageInfo,
    systemKeyPair,
    userKeyPair,
    user
  }: GenerateLotteryInput): Promise<GenerateLotteryOutput> {
    const lastSeriesNumber = await this.getLastSeriesNumber();
    const lotteryNumbers = await this.generateLotteryNumber(
      packageInfo.count,
      tohirol._id
    );
    const orderedLotteryList: OrderedLottery[] = [];
    const lotteryList: Lottery[] = [];

    let newSeriesNumber = lastSeriesNumber;
    lotteryNumbers.forEach((lNum) => {
      newSeriesNumber += 1;
      // const newSeries = this.seriesFormatter(newSeriesNumber, 5);
      const lotteryData = {
        seriesNumber: newSeriesNumber,
        userId: user._id,
        userPhoneNumber: user.phoneNumber,
        type: packageInfo.type,
        amount: packageInfo.amount,
        transactionId,
        tohirol: tohirol._id
      };

      const lotterySecureData = {
        seriesNumber: newSeriesNumber,
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
        status: "ACTIVE",
        tohirol: tohirol._id
      });
      lotteryList.push({
        ...lotteryData,
        secureData: encryptedSecureData
      });
    });

    return {
      orderedLotteryList,
      lotteryList,
      lotteryNumbers,
      lastSeriesNumber: newSeriesNumber
    };
  }

  async createLotteryNumbers(
    data: CreateQueueInput,
    session: mongoose.mongo.ClientSession
  ): Promise<CreateQueueOutput> {
    try {
      const packageInfo = this.getPackageFromAmount(data.transaction.amount);
      const tohirolRes = await this.tohirolService.getActiveTohirol();

      if (tohirolRes.code === 500) {
        throw new Error(tohirolRes.message);
      }
      const tohirol = tohirolRes.data;

      // Tohirol duursen esehiig shalgana
      const allLottery = await LotteryModel.find({
        tohirol: tohirol._id
      });

      if (tohirol.status === TohirolStatus.FILLED) {
        throw new Error("Тохирол дүүрсэн байна!");
      }
      if (allLottery.length >= tohirol.totalTicket) {
        this.tohirolService.changeTohirolStatus(TohirolStatus.FILLED);
        throw new Error("Тохирол дүүрсэн байна!");
      }

      const vaultManager = VaultManager.getInstance();

      const systemSecret = (await vaultManager.read(
        "kv/data/systemSecret"
      )) as KeyPair;

      if (!systemSecret) {
        throw new Error("System secret олдсонгүй!");
      }

      const userSecret = (await vaultManager.read(
        `secret/data/${data.user._id}`
      )) as KeyPair;

      if (!userSecret) {
        throw new Error("Хэрэглэгчийн secret олдсонгүй! " + data.user._id);
      }

      // Lottery датаг үүсгэнэ
      const response = await this.generateLottery({
        tohirol,
        transactionId: data.transaction.id,
        packageInfo,
        user: data.user,
        systemKeyPair: systemSecret,
        userKeyPair: userSecret
      });

      await OrderedLotteryModel.insertMany(response.orderedLotteryList, {
        session
      });

      await LotteryModel.insertMany(response.lotteryList, {
        session
      });

      if (response.lotteryNumbers.length > 5) {
        response.lotteryNumbers.map((ln, index) => {
          if (index % 5 === 0 && index > 0) {
            const smsLn = response.lotteryNumbers.slice(index - 5, index);
            const smsBody = getLotterySmsBody(smsLn);
            this.smsService.smsRequestSentToQueue(
              data.user.operator,
              data.user.phoneNumber,
              smsBody,
              JSON.stringify(data.transaction)
            );
          }
        });
      } else {
        const smsBody = getLotterySmsBody(response.lotteryNumbers);
        this.smsService.smsRequestSentToQueue(
          data.user.operator,
          data.user.phoneNumber,
          smsBody,
          JSON.stringify(data.transaction)
        );
      }

      await this.updateLastSeriesNumber(response.lastSeriesNumber);
      return {
        result: true,
        transaction: {
          change: packageInfo?.change
        }
      };
    } catch (err) {
      if (err instanceof Error) {
        return {
          result: false,
          message: `${err.name} - ${err.message}`
        };
      }
      errorLog("CREATE LOTTERY ERROR ", err);
      return {
        result: false,
        message: "CREATE LOTTERY ERROR "
      };
    }
  }

  async getUserLotteries(user: User): Promise<LotteryWithNumber[]> {
    const userId = user._id;
    const lotteries = await LotteryModel.find({
      userId
    });
    const vaultManager = VaultManager.getInstance();
    const userSecret = (await vaultManager.read(
      `secret/data/${userId}`
    )) as KeyPair;

    return lotteries.map((lot) => {
      const { secureData, ...other } = lot.toJSON();
      const encryptedData = decryptData(secureData, userSecret.privateKey);
      lot.secureData;
      return {
        ...other,
        ...JSON.parse(encryptedData)
      };
    });
  }
}
