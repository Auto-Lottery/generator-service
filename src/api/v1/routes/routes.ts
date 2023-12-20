import express from "express";
import userRoutes from "./user.routes";
import { AuthApiService } from "../services/auth-api.service";
import lotteryRoutes from "./loterry.routes";
const V1Routes = express.Router();

V1Routes.get("/", (req, res) => {
  res.send({
    data: "v1"
  });
});

V1Routes.use("/user", AuthApiService.verifyToken, userRoutes);
V1Routes.use("/lottery", AuthApiService.adminVerifyToken, lotteryRoutes);

export default V1Routes;
