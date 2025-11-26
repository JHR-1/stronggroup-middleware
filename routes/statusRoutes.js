import express from "express";
import { ensureSession, bullhornPost } from "../bullhorn.js";

const router = express.Router();

/******************************************************
 * UPDATE PIPELINE STATUS
 ******************************************************/
router.post("/candidate/:id/status", ensureSession, async (req, res) => {
  try {
    const { id } = req.params;
    const tokens = req.tokens;
    const { status } = req.body;

    const response = await bullhornPost(
      `entity/Candidate/${id}`,
      tokens,
      { status }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status", details: err.response?.data });
  }
});

export default router;
