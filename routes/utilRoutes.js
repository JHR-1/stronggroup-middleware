import express from "express";
import { ensureSession } from "../bullhorn.js";   // needed for Bullhorn API access

const router = express.Router();

// -------------------------------------------------------------
// HEALTH CHECK (kept exactly as you had it)
// -------------------------------------------------------------
router.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

// -------------------------------------------------------------
// BULLHORN CANDIDATE METADATA EXTRACTION
// This route pulls the full system-field metadata for Candidates
// -------------------------------------------------------------
router.get("/meta/candidate", ensureSession, async (req, res) => {
  try {
    const { restToken, restUrl } = req.session.bullhorn;

    if (!restToken || !restUrl) {
      return res.status(400).json({ error: "Missing Bullhorn session info" });
    }

    const url = `${restUrl}meta/Candidate?fields=*`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "BhRestToken": restToken
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Metadata error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

