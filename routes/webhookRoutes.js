import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";

const router = express.Router();

router.post("/incoming", async (req, res) => {
  console.log("Webhook:", req.body);
  res.json({ success: true });
});

export default router;
