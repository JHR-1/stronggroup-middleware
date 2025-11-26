import express from "express";
import {
  ensureSession,
  bullhornGet,
  bullhornPost,
  bullhornPut
} from "../bullhorn.js";

const router = express.Router();

/************************************************************
 * SEARCH CANDIDATES
 ************************************************************/
router.get("/search", ensureSession, async (req, res) => {
  try {
    const { query } = req.query;
    const tokens = req.tokens;

    const response = await bullhornGet("search/Candidate", tokens, {
      query,
      fields: "id,firstName,lastName,email,phone,status",
    });

    res.json(response.data);
  } catch (err) {
    console.error("Candidate search error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Candidate search failed",
      details: err.response?.data,
    });
  }
});

/************************************************************
 * GET CANDIDATE BY ID
 ************************************************************/
router.get("/:id", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { id } = req.params;

    const response = await bullhornGet(`entity/Candidate/${id}`, tokens, {
      fields: "*",
    });

    res.json(response.data);
  } catch (err) {
    console.error("Get candidate error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to get candidate",
      details: err.response?.data,
    });
  }
});

/************************************************************
 * UPDATE CANDIDATE
 ************************************************************/
router.put("/:id", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { id } = req.params;
    const payload = req.body;

    const response = await bullhornPost(
      `entity/Candidate/${id}`,
      tokens,
      payload
    );

    res.json({ success: true, response: response.data });
  } catch (err) {
    console.error("Update candidate error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to update candidate",
      details: err.response?.data,
    });
  }
});

/************************************************************
 * CREATE CANDIDATE
 ************************************************************/
router.post("/create", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const payload = req.body;

    const response = await bullhornPut("entity/Candidate", tokens, payload);

    res.json({
      success: true,
      candidateId: response.data.changedEntityId,
      raw: response.data,
    });
  } catch (err) {
    console.error("Create candidate error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to create candidate",
      details: err.response?.data,
    });
  }
});

export default router;
