import express from "express";
import { sendSMS, sendEmail } from "../utils/comms.js";

const router = express.Router();

/**
 * Test endpoint
 */
router.get("/test", (req, res) => {
  res.json({ status: "Comms system OK" });
});

/**
 * Send SMS
 * POST /comms/sms
 * { personId: 123, message: "Hello!" }
 */
router.post("/sms", async (req, res) => {
  const { personId, message } = req.body;

  if (!personId || !message) {
    return res.status(400).json({ error: "Missing personId or message" });
  }

  try {
    const result = await sendSMS(personId, message);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.toString() });
  }
});

/**
 * Send Email
 * POST /comms/email
 * { personId: 123, subject: "...", body: "..." }
 */
router.post("/email", async (req, res) => {
  const { personId, subject, body } = req.body;

  if (!personId || !subject || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const result = await sendEmail(personId, subject, body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.toString() });
  }
});

export default router;
