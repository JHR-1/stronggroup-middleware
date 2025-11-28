import express from "express";
import { bullhornPost } from "../bullhorn.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const tokens = req.tokens;
    const { candidateId, jobOrderId, status } = req.body;

    if (!candidateId || !jobOrderId) {
      return res.status(400).json({ error: "Missing candidateId or jobOrderId" });
    }

    const result = await bullhornPost("entity/JobSubmission", tokens, {
      candidate: { id: candidateId },
      jobOrder: { id: jobOrderId },
      status: status || "Submitted"
    });

    res.json({ message: "Submission created", result });
  } catch (err) {
    console.error("Submission error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create submission" });
  }
});

export default router;
