import express from "express";
import { ensureSession, bullhornPut } from "../bullhorn.js";

const router = express.Router();

/******************************************************
 * CREATE TASK
 ******************************************************/
router.post("/create", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const payload = req.body;

    const response = await bullhornPut("entity/Task", tokens, payload);

    res.json({ success: true, taskId: response.data.changedEntityId });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create task",
      details: err.response?.data
    });
  }
});

export default router;
