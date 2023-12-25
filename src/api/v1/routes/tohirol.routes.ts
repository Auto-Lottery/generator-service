import express from "express";
import { TohirolService } from "../services/tohirol.service";
import { AuthApiService } from "../services/auth-api.service";

const tohirolRoutes = express.Router();

tohirolRoutes.post(
  "/create",
  AuthApiService.adminVerifyToken,
  async (req, res) => {
    const tohirolService = new TohirolService();
    try {
      const response = await tohirolService.createTohirol(
        req.body,
        req.user?._id || ""
      );

      return res.send(response);
    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

export default tohirolRoutes;
