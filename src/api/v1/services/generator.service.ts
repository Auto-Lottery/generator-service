import mongoose from "mongoose";
import { transactional } from "../config/mongodb";
import { CreateQueueInput, CreateQueueOutput } from "../types/create-queue";
import { LotteryService } from "./lottery.service";
import RabbitMQManager from "./rabbit-manager";
import { errorLog } from "../utilities/log";

export class GeneratorService {
  private rabbitMqManager: RabbitMQManager;
  private lotteryService: LotteryService;

  constructor() {
    this.rabbitMqManager = RabbitMQManager.getInstance();
    this.lotteryService = new LotteryService();
  }

  async generatorQueue() {
    const queueChannel = await this.rabbitMqManager.createChannel("generator");

    queueChannel.assertExchange("generator", "direct", {
      durable: true
    });

    // Queue nernuudiig suuld uurchilnu
    const queueName = "barimt";
    const routingKey = "create";

    queueChannel.assertQueue(queueName, {
      durable: true
    });

    queueChannel.bindQueue(queueName, "generator", routingKey);

    queueChannel.prefetch(1);

    queueChannel.consume(
      queueName,
      async (msg) => {
        if (msg?.content) {
          const dataJsonString = msg.content.toString();

          if (!dataJsonString) {
            errorLog("Queue empty message");
            queueChannel.ack(msg);
            return;
          }
          try {
            const inputData: CreateQueueInput = JSON.parse(
              dataJsonString
            ) as CreateQueueInput;

            const session = await mongoose.startSession();
            const res = await transactional<CreateQueueOutput>(session, () =>
              this.lotteryService.createLotteryNumbers(inputData, session)
            );
            session.endSession();
            if (res === null) {
              errorLog(
                "Lottery generate queue transactional error: ",
                inputData
              );
              return;
            }
            if (res.result) {
              this.sendToTransaction({
                transactionId: inputData.transaction.id,
                status: "COMPLETE",
                description: "Амжилттай үүслээ"
                // ...res?.transaction
              });
            } else {
              // Transaction service-ruu queue shidne
              this.sendToTransaction({
                transactionId: inputData.transaction.id,
                status: "FAILED",
                description: res.message || "Алдаа гарлаа"
              });
            }
            queueChannel.ack(msg);
          } catch (err) {
            errorLog("Lottery generate queue error: ", err);
          }
        }
      },
      {
        noAck: false
      }
    );
  }

  async sendToTransaction(data: {
    transactionId: string;
    status: string;
    description: string;
  }) {
    const rabbitMQManager = RabbitMQManager.getInstance();
    const rabbitMqChannel =
      await rabbitMQManager.createChannel("bank_transaction");
    if (rabbitMqChannel) {
      // Амжилттай болсон Transaction-ний ID шиднэ.
      rabbitMqChannel.sendToQueue(
        "transaction",
        Buffer.from(JSON.stringify(data)),
        {
          persistent: true
        }
      );
    }
  }
}
