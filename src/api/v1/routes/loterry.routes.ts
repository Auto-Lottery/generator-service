import express from "express";
import { LotteryService } from "../services/lottery.service";
import { errorLog } from "../utilities/log";

const lotteryRoutes = express.Router();

lotteryRoutes.get("/list", async (req, res) => {
  const { page, pageSize, sortBy } = req.query;
  const lotteryService = new LotteryService();
  if (req?.user) {
    try {
      const lotteryList = await lotteryService.getLotteryList(
        Number(page || 1),
        Number(pageSize || 10),
        sortBy as string
      );
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
