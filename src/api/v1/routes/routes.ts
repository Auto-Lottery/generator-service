import express from "express";
import userRoutes from "./user.routes";
import { AuthApiService } from "../services/auth-api.service";
import lotteryRoutes from "./loterry.routes";
import tohirolRoutes from "./tohirol.routes";
const V1Routes = express.Router();

V1Routes.get("/", (req, res) => {
  res.send({
    data: "v1"
  });
});

V1Routes.use("/user", AuthApiService.verifyToken, userRoutes);
V1Routes.use("/lottery", AuthApiService.adminVerifyToken, lotteryRoutes);
V1Routes.use("/tohirol", tohirolRoutes);

export default V1Routes;
