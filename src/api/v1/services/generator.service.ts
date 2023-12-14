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

          console.log("Ready generate! ", inputData);

          const res = await this.lotteryService.createLotteryNumbers(inputData);
          if (res.result) {
            queueChannel.ack(msg);
          } else {
            // Transaction service-ruu queue shidne
          }
        }
      },
      {
        noAck: false
      }
    );
  }
}
