import express from "express";
import { bullhornGet } from "../bullhorn.js";

const router = express.Router();

/**
 * Modern Bullhorn Candidate Search
 * GET /candidates/search?query=John
 */
router.get("/search", async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ error: "Missing ?query param" });
    }

    const tokens = req.tokens;

    const { data } = await bullhornGet(
      "search/Candidate",
      tokens,
      {
        query: query,
        fields: "id,firstName,lastName,email,phone,status",
        start: 0,
        count: 20
      }
    );

    res.json({
      total: data.total,
      count: data.count,
      start: data.start,
      data: data.data
    });

  } catch (err) {
    console.error("Candidate search error:", err.response?.data || err.message);

    res.status(500).json({
      error: "Candidate search failed",
      details: err.response?.data || err.message
    });
  }
});

export default router;



