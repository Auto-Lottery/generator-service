import { createClient } from "redis";
import { errorLog } from "../utilities/log";

export class RedisManager {
  private static instance: RedisManager;
  private client: ReturnType<typeof createClient> | null = null;

  private constructor() {}

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  public getClient() {
    return this.client;
  }

  public async connect(url: string, password: string): Promise<void> {
    this.client = createClient({
      url,
      password
    });
    this.client.connect();
    this.client.on("error", (err) => {
      errorLog(err);
      throw new Error(`Redis connection error.`);
    });
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      this.client = null;
    }
  }
}
