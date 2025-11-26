import express from "express";
import {
  ensureSession,
  bullhornPut
} from "../bullhorn.js";

const router = express.Router();

router.post("/create", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const payload = req.body;

    const response = await bullhornPut("entity/Placement", tokens, payload);

    res.json({
      success: true,
      placementId: response.data.changedEntityId
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create placement",
      details: err.response?.data
    });
  }
});

export default router;
