import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

/****************************************************
 * 1) /auth/start — Redirect user to Bullhorn
 ****************************************************/
router.get("/start", async (req, res) => {
  try {
    const authUrl =
      `https://auth.bullhornstaffing.com/oauth/authorize?response_type=code` +
      `&client_id=${process.env.CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`;

    return res.redirect(authUrl);
  } catch (err) {
    console.error("AUTH START ERROR:", err);
    return res.status(500).json({ error: "Auth start failed", details: err.message });
  }
});

/****************************************************
 * 2) /auth/callback — Bullhorn redirects here
 ****************************************************/
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing ?code param in callback" });
  }

  try {
    // Exchange code for refresh token + access token
    const tokenUrl = "https://auth.bullhornstaffing.com/oauth/token";

    const params = {
      grant_type: "authorization_code",
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
    };

    const { data } = await axios.post(tokenUrl, null, { params });

    // Store the refresh token in memory
    process.env.BH_REFRESH_TOKEN = data.refresh_token;

    console.log("✓ OAuth Success — refresh token received.");
    return res.send("OAuth Success! Tokens stored.");
  } catch (err) {
    console.error("CALLBACK ERROR:", err.response?.data || err.message);
    return res.status(500).json({ error: "Callback failed", details: err.message });
  }
});

export default router;



