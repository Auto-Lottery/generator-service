import RabbitMQManager from "./rabbit-manager";

export class GeneratorService {
  private rabbitMqManager: RabbitMQManager;

  constructor() {
    this.rabbitMqManager = RabbitMQManager.getInstance();
  }

  async generatorQueue() {
    const queueChannel = await this.rabbitMqManager.createChannel("generator");

    queueChannel.assertExchange("generator", "direct", {
      durable: true
    });

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
          console.log("Generate ", JSON.parse(msg.content.toString()));
        }
      },
      {
        noAck: false
      }
    );
  }
}
