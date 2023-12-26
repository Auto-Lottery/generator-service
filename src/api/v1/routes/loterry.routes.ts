import express from "express";
import { LotteryService } from "../services/lottery.service";
import { errorLog } from "../utilities/log";

const lotteryRoutes = express.Router();

lotteryRoutes.post("/list", async (req, res) => {
  const filter = req.body;
  const lotteryService = new LotteryService();
  if (req?.user) {
    try {
      const lotteryList = await lotteryService.getLotteryList(filter);
      return res.send({
        code: 200,
        data: lotteryList
      });
    } catch (err) {
      errorLog("GET LIST::: ", err);
      return res.status(500).json(err);
    }
  }
  return res.status(401).json({ message: "Unauthorized" });
});

lotteryRoutes.post("/userLotteryList", async (req, res) => {
  const filter = req.body;
  const lotteryService = new LotteryService();
  if (req?.user) {
    try {
      const lotteryList = await lotteryService.getUserLotteryList(filter);
      return res.send({
        code: 200,
        data: lotteryList
      });
    } catch (err) {
      errorLog("GET LIST::: ", err);
      return res.status(500).json(err);
    }
  }
  return res.status(401).json({ message: "Unauthorized" });
});

export default lotteryRoutes;
