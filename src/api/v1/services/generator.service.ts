import { CreateQueueInput } from "../types/create-queue-input";
import { LotteryService } from "./lottery.service";
import RabbitMQManager from "./rabbit-manager";

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
          const inputData: CreateQueueInput = JSON.parse(
            msg.content.toString()
          ) as CreateQueueInput;

          const res = await this.lotteryService.createLotteryNumbers(inputData);
          if (res.result) {
            this.sendToTransaction({
              transactionId: inputData.transaction.id,
              status: "COMPLETE",
              description: "Амжилттай үүслээ"
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
