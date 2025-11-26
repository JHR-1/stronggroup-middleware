import express from "express";
import {
  ensureSession,
  bullhornPost
} from "../bullhorn.js";

const router = express.Router();

/******************************************************
 * ADD NOTE
 ******************************************************/
router.post("/add", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { comments, personId, personType = "Candidate" } = req.body;

    const payload = {
      comments,
      action: "Note",
      personReference: {
        id: personId,
        type: personType
      }
    };

    const response = await bullhornPost("entity/Note", tokens, payload);

    res.json({ success: true, noteId: response.data.changedEntityId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add note", details: err.response?.data });
  }
});

/******************************************************
 * LOG EMAIL
 ******************************************************/
router.post("/email", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { subject, body, personId } = req.body;

    const payload = {
      subject,
      body,
      personReference: { id: personId, type: "Candidate" }
    };

    const response = await bullhornPost("entity/ActivityEmail", tokens, payload);

    res.json({ success: true, emailId: response.data.changedEntityId });
  } catch (err) {
    res.status(500).json({ error: "Email failed", details: err.response?.data });
  }
});

/******************************************************
 * LOG SMS
 ******************************************************/
router.post("/sms", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { message, personId } = req.body;

    const payload = {
      action: "Text Message",
      comments: message,
      personReference: { id: personId, type: "Candidate" }
    };

    const response = await bullhornPost("entity/Activity", tokens, payload);
    res.json({ success: true, smsId: response.data.changedEntityId });

  } catch (err) {
    res.status(500).json({ error: "SMS failed", details: err.response?.data });
  }
});

export default router;
