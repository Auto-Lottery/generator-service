import { PackageInfo } from "./package-info";
import { KeyPair } from "./secret";
import { Tohirol } from "./tohirol";
import { User } from "./user";

export type GenerateLotteryInput = {
  tohirol: Tohirol;
  transactionId: string;
  systemKeyPair: KeyPair;
  userKeyPair: KeyPair;
  user: User;
  packageInfo: PackageInfo;
};
