import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";


const router = express.Router();

router.get("/", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;

    const response = await bullhornGet("query/CorporateUser", tokens, {
      where: "isDeleted=false",
      fields: "id,firstName,lastName,email"
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch users",
      details: err.response?.data
    });
  }
});

export default router;
