import express from "express";
import { bullhornPost } from "../bullhorn.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const tokens = req.tokens;
    const { entityType, entityId, comments } = req.body;

    if (!entityType || !entityId || !comments) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await bullhornPost("entity/Note", tokens, {
      comments,
      personReference: {
        id: entityId
      },
      action: entityType
    });

    res.json({ message: "Note added", result });
  } catch (err) {
    console.error("Note error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to add note" });
  }
});

export default router;
