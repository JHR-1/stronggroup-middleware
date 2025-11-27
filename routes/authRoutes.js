import express from "express";
const router = express.Router();

// AUTH ROUTES MUST NOT REQUIRE SESSION CHECKS

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const router = express.Router();

/**
 * 1️⃣  START OAUTH FLOW
 * Redirects user to Bullhorn login/authorization page.
 */
router.get("/start", (req, res) => {
  const url = `https://auth.bullhornstaffing.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}`;
  res.redirect(url);
});

/**
 * 2️⃣  OAUTH CALLBACK
 * Bullhorn sends ?code=XYZ here after user login.
 * We exchange that code for an access token + refresh token.
 */
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing ?code in callback URL");

  try {
    // Step 1: Exchange code for access + refresh tokens
    const tokenResponse = await axios.post(
      "https://auth.bullhornstaffing.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Step 2: Log into Bullhorn REST API to get BhRestToken + restUrl
    const loginResponse = await axios.get(
      `https://rest.bullhornstaffing.com/rest-services/login?version=*&access_token=${access_token}`
    );

    const { BhRestToken, restUrl } = loginResponse.data;

    // Step 3: Save tokens locally (Render will keep them in the ephemeral file system)
    const tokens = { BhRestToken, restUrl, refreshToken: refresh_token };
    fs.writeFileSync("tokens.json", JSON.stringify(tokens, null, 2));

    // Step 4: Confirm success
    res.send("✅ OAuth Success! Tokens stored.");
  } catch (err) {
    console.error("OAuth Callback Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to complete OAuth flow",
      details: err.response?.data || err.message,
    });
  }
});

/**
 * 3️⃣  OPTIONAL: Direct login (for manual refresh testing)
 */
router.get("/login", async (req, res) => {
  res.redirect("/auth/start");
});

export default router;

