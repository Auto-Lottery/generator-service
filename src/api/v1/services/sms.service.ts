import { errorLog } from "../utilities/log";
import RabbitMQManager from "./rabbit-manager";

export class SmsService {
  constructor() {}

  async smsRequestSentToQueue(
    operator: string,
    toNumber: string,
    smsBody: string,
    additionalData?: string,
  ) {
    try {
      const rabbitMQManager = RabbitMQManager.getInstance();
      const rabbitMqChannel = await rabbitMQManager.createChannel("sms");
      if (rabbitMqChannel) {
        rabbitMqChannel.sendToQueue(
          operator,
          Buffer.from(
            JSON.stringify({
              operator,
              toNumber,
              smsBody,
              additionalData
            })
          ),
          {
            persistent: true
          }
        );
      }
    } catch (err) {
      errorLog(err);
    }
  }
}
