import { User } from "./user";

export type CreateQueueInput = {
  user: User;
  transaction: {
    id: string;
    amount: number;
  };
};
