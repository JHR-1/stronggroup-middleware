import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";

const router = express.Router();

/**
 * GET /candidates/search?query=John
 * Searches candidates by name using Bullhorn Search API.
 */
router.get("/search", ensureSession, async (req, res) => {
  try {
    const { BhRestToken, restUrl } = req.tokens;
    const query = req.query.query || "John";

    const url = `${restUrl}search/Candidate?query=${encodeURIComponent(
      query
    )}&fields=id,firstName,lastName,email&count=10&BhRestToken=${BhRestToken}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("Candidate search error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch candidates",
      details: err.response?.data || err.message,
    });
  }
});

export default router;
