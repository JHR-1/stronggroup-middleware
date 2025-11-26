import express from "express";
import { getBullhornRestToken } from "../bullhorn.js";

const router = express.Router();

/**
 * Start Bullhorn session manually
 * GET /auth/login
 */
router.get("/login", async (req, res) => {
  try {
    const tokens = await getBullhornRestToken();
    res.json({
      success: true,
      message: "Bullhorn session started",
      tokens
    });
  } catch (err) {
    console.error("AUTH ERROR:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: "Failed to authenticate with Bullhorn",
      details: err.response?.data || err.message
    });
  }
});

export default router;
