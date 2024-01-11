import * as crypto from "crypto";
import { Transaction } from "../types/transaction";

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export const generateFakeTransaction = (): Transaction => {
  const amount = [20000, 50000, 100000];
  const users = ["85266716", "99646141"];
  const selectAmountIndex = getRandomInt(0, amount.length);
  const selectUserIndex = getRandomInt(0, users.length);

  return {
    record: getRandomInt(10000, 50000),
    tranDate: Date.now().toString(),
    postDate: Date.now().toString(),
    amount: amount[selectAmountIndex],
    description: users[selectUserIndex],
    relatedAccount: "5050505050"
  };
};

export const generateRandom8DigitNumber = (): number => {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandom6DigitNumber = (): number => {
  const min = 100000; // Smallest 6-digit number
  const max = 999999; // Largest 6-digit number

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const seriesFormatter = (
  seriesNumber: number,
  length: number
): string => {
  // Session-tei hiiwel prefix nemne
  return seriesNumber.toString().padStart(length, "0");
};

export const encryptData = (plainText: string, publicKey: string): string => {
  const encryptedBuffer = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(plainText, "utf-8")
  );

  return encryptedBuffer.toString("base64");
};

export const decryptData = (
  encryptedData: string,
  privateKey: string
): string => {
  const decryptedBuffer = crypto.privateDecrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(encryptedData, "base64")
  );

  return decryptedBuffer.toString("utf-8");
};

export const getLotterySmsBody = (lotteryNumbers: string[]) => {
  return `AutoPrime: Tanii hudaldan avsan sugalaanii dugaar ${lotteryNumbers.join(
    ", "
  )}.`;
};

export const groupArray = (array: string[], groupSize: number) => {
  const result: string[][] = [];

  for (let i = 0; i < array.length; i += groupSize) {
    result.push(array.slice(i, i + groupSize));
  }

  return result;
};
