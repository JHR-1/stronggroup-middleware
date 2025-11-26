import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";

const router = express.Router();

/**
 * GET /candidates/search?query=John
 * Searches candidates by name using Bullhorn QUERY API.
 */
router.get("/search", ensureSession, async (req, res) => {
  try {
    const { BhRestToken, restUrl } = req.tokens;
    const query = req.query.query || "John";

    // Query endpoint instead of search
    const url = `${restUrl.replace(/\/?$/, "/")}query/Candidate?where=firstName LIKE '%${query}%' OR lastName LIKE '%${query}%'&fields=id,firstName,lastName,email&count=20&BhRestToken=${BhRestToken}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("Candidate query error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch candidates",
      details: err.response?.data || err.message,
    });
  }
});

export default router;

