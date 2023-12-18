import { User } from "./user";

export type CreateQueueInput = {
  user: User;
  transaction: {
    id: string;
    amount: number;
  };
};

export type CreateQueueOutput = {
  result: boolean;
  transaction?: Record<string, string | number | undefined>;
  message?: string;
};
