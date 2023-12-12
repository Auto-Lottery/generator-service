import amqp, { Channel } from "amqplib/callback_api";

export class RabbitMqService {
  static channel: Channel;
  static connected: boolean = false;

  static async connect(configs: Record<string, string | number>) {
    return new Promise((resolve) => {
      amqp.connect(
        {
          hostname: configs.RABBIT_MQ_HOST as string,
          port: configs.RABBIT_MQ_PORT as number,
          username: configs.RABBIT_MQ_USER as string,
          password: configs.RABBIT_MQ_PASSWORD as string
        },
        (error0, connection) => {
          if (error0) {
            console.log("RABBIT CONNECTION ERR::: ", error0);
            throw new Error("INTERNAL SERVER ERROR");
          }
          connection.createChannel((error1, channel) => {
            if (error1) {
              console.log("RABBIT CHANNEL ERR::: ", error1);
              throw new Error("INTERNAL SERVER ERROR");
            }

            this.channel = channel;

            console.log("RabbitMQ connected.");

            this.channel.assertExchange(
              configs.QUEUE_EXCHANGE_NAME as string,
              "direct",
              {
                durable: true
              }
            );
            this.connected = true;
            resolve(true);
          });
        }
      );
    });
  }

  static generatorQueue() {
    const queueName = "barimt";
    const routingKey = "create";
    this.channel.assertQueue(
      queueName,
      {
        durable: true
      },
      (err) => {
        if (err) {
          console.log(`RABBIT BIND ${queueName} ERR::: `, err);
          throw new Error("INTERNAL SERVER ERROR");
        }
        this.channel.bindQueue(queueName, "generator", routingKey);
      }
    );

    this.channel.prefetch(1);

    this.channel.consume(
      queueName,
      async (msg) => {
        if (msg?.content) {
          const data = JSON.parse(msg.content.toString());
          try {
            console.log(data);
            // Database-ruu bichne
            this.channel.ack(msg);
          } catch (err) {
            console.log(`SAVE DEPOSIT TRANSACTION ERR::: `, err);
          }
        }
      },
      {
        noAck: false
      }
    );
  }
}
