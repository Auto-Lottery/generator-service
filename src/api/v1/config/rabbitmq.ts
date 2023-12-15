import RabbitMQManager from "../services/rabbit-manager";
import VaultManager from "../services/vault-manager";
import { errorLog } from "../utilities/log";

export const connectQueue = async () => {
  const rabbitMQManager = RabbitMQManager.getInstance();
  try {
    const vaultManager = VaultManager.getInstance();
    const config = await vaultManager.read("kv/data/rabbitmq");
    await rabbitMQManager.init(config);
  } catch (error) {
    await rabbitMQManager.closeConnection();
    errorLog("RABBIT CONNECT ERR::: ", error);
    throw new Error("RabbitMQ-тэй холбогдоход алдаа гарлаа");
  }
};
