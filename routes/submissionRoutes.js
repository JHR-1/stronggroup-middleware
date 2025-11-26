import express from "express";
import {
  ensureSession,
  bullhornPut
} from "../bullhorn.js";

const router = express.Router();

/******************************************************
 * CREATE SUBMISSION (CV Send)
 ******************************************************/
router.post("/create", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { candidateId, jobId, status = "Submitted", comments } = req.body;

    const payload = {
      candidate: { id: candidateId },
      jobOrder: { id: jobId },
      status,
      comments
    };

    const response = await bullhornPut("entity/JobSubmission", tokens, payload);

    res.json({
      success: true,
      submissionId: response.data.changedEntityId
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create submission", details: err.response?.data });
  }
});

export default router;
