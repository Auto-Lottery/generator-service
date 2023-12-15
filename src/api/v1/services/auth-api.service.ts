import axios from "axios";
import { AUTH_SERVICE_URL } from "../config";
import { NextFunction, Request, Response } from "express";
import { debugLog } from "../utilities/log";

export class AuthApiService {
  constructor() {}

  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = await axios.get(
        `${AUTH_SERVICE_URL}/v1/auth/verifyToken`,
        {
          headers: {
            Authorization: req.headers.authorization
          }
        }
      );
      debugLog(data);
      req.user = data;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
}