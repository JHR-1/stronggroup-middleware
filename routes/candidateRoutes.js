import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";

const router = express.Router();

/**
 * GET /candidates/search?query=John
 * Flexible Bullhorn search using QUERY endpoint.
 */
router.get("/search", ensureSession, async (req, res) => {
  try {
    const { BhRestToken, restUrl } = req.tokens;
    const query = req.query.query || "John";

    // Try multiple fields to maximise hits
    const where = encodeURIComponent(
      `(firstName LIKE '%${query}%' OR lastName LIKE '%${query}%' OR name LIKE '%${query}%')`
    );

    const url = `${restUrl.replace(/\/?$/, "/")}query/Candidate?where=${where}&fields=id,firstName,lastName,name,email&count=50&BhRestToken=${BhRestToken}`;

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


