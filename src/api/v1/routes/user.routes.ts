import express from "express";
import { LotteryService } from "../services/lottery.service";
import { errorLog } from "../utilities/log";

const userRoutes = express.Router();

userRoutes.get("/getLotteries", async (req, res) => {
  const lotteryService = new LotteryService();
  if (req?.user) {
    try {
      const lotteryList = await lotteryService.getUserLotteries(req.user);
      return res.send({
        lotteryList
      });
    } catch (err) {
      errorLog("GET LOTTERIES::: ", err);
      return res.status(500).json(err);
    }
  }
  return res.status(401).json({ message: "Unauthorized" });
});

export default userRoutes;
