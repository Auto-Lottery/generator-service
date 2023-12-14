import { PackageInfo } from "./package-info";
import { KeyPair } from "./secret";
import { User } from "./user";

export type GenerateLotteryInput = {
  transactionId: string;
  systemKeyPair: KeyPair;
  userKeyPair: KeyPair;
  user: User;
  packageInfo: PackageInfo;
};
