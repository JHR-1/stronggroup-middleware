import express from "express";
import axios from "axios";
import fs from "fs";

const router = express.Router();

// Load tokens.json (BhRestToken, restUrl, refreshToken)
function loadTokens() {
  try {
    const data = fs.readFileSync("tokens.json", "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// Check session exists
function ensureSession(req, res, next) {
  const tokens = loadTokens();
  if (!tokens || !tokens.BhRestToken || !tokens.restUrl) {
    return res.status(401).json({ error: "No active Bullhorn session. Run /auth/start first." });
  }
  req.tokens = tokens;
  next();
}

// =============================
// SEARCH CANDIDATES
// =============================
router.get("/candidate/search", ensureSession, async (req, res) => {
  try {
    const { query } = req.query;
    const { BhRestToken, restUrl } = req.tokens;

    const response = await axios.get(`${restUrl}search/Candidate`, {
      params: {
        query,
        BhRestToken,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Bullhorn Search Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Bullhorn search failed", details: err.response?.data });
  }
});

export default router;
