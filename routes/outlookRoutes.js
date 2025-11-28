import express from "express";
import {
  getOutlookAuthUrl,
  exchangeCodeForOutlookToken,
  getValidOutlookToken
} from "../utils/outlook.js";

import db from "../utils/db.js";
import axios from "axios";

const router = express.Router();

router.get("/auth/initiate", (req, res) => {
  const url = getOutlookAuthUrl();
  res.redirect(url);
});

router.get("/auth/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const userId = req.session.userId;

    const tokenData = await exchangeCodeForOutlookToken(code);

    await db("users")
      .where({ id: userId })
      .update({
        outlook_access_token: tokenData.access_token,
        outlook_refresh_token: tokenData.refresh_token,
        outlook_expires: Date.now() + tokenData.expires_in * 1000,
      });

    res.send("Outlook connected successfully. You can close this tab.");
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth error");
  }
});

// Example: Read inbox messages
router.get("/messages", async (req, res) => {
  const user = await db("users").where({ id: req.session.userId }).first();
  const token = await getValidOutlookToken(user);

  const response = await axios.get(
    "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=25",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  res.json(response.data);
});

// Example: Send email
router.post("/send", async (req, res) => {
  const { to, subject, body } = req.body;

  const user = await db("users").where({ id: req.session.userId }).first();
  const token = await getValidOutlookToken(user);

  const email = {
    message: {
      subject,
      body: { contentType: "HTML", content: body },
      toRecipients: [{ emailAddress: { address: to } }],
    }
  };

  await axios.post(
    "https://graph.microsoft.com/v1.0/me/sendMail",
    email,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  res.json({ status: "sent" });
});

export default router;

