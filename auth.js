import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BH_USERNAME = process.env.BH_USERNAME;
const BH_PASSWORD = process.env.BH_PASSWORD;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Bullhorn endpoints
const AUTH_BASE_URL = "https://auth.bullhornstaffing.com/oauth";
const TOKEN_URL = `${AUTH_BASE_URL}/token`;

// =========================
// Step 1: Redirect to Bullhorn
// =========================
router.get("/start", (req, res) => {
  const url =
    `${AUTH_BASE_URL}/authorize?response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  console.log("Redirecting user to Bullhorn:", url);
  res.redirect(url);
});

// =========================
// Step 2: OAuth Callback — FIXED
// =========================
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("No authorization code received.");
  }

  try {
    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    });

    console.log("Requesting access token...");

    const tokenResponse = await axios.post(TOKEN_URL, tokenParams);
    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;

    console.log("Access token received.");

    // =========================
    // FIXED: REST LOGIN (GET, not POST)
    // =========================
    const loginUrl =
      `https://rest.bullhornstaffing.com/rest-services/login` +
      `?version=2.0` +
      `&access_token=${accessToken}` +
      `&username=${BH_USERNAME}` +
      `&password=${BH_PASSWORD}`;

    console.log("Logging into REST API...");

    const loginResponse = await axios.get(loginUrl);

    const { BhRestToken, restUrl } = loginResponse.data;

    console.log("REST Login Success:", restUrl);

    // Save tokens to file
    fs.writeFileSync(
      "tokens.json",
      JSON.stringify(
        {
          BhRestToken,
          restUrl,
          refreshToken,
          timestamp: new Date()
        },
        null,
        2
      )
    );

    res.send("OAuth Success! Tokens stored.");
  } catch (err) {
    console.log("\n=======================");
    console.log("🔥 FULL BULLHORN ERROR:");
    console.log("=======================\n");

    console.log("MESSAGE:", err.message);
    console.log("STACK:", err.stack);

    if (err.response) {
      console.log("\n--- RESPONSE DATA ---");
      console.log(err.response.data);

      console.log("\n--- RESPONSE STATUS ---");
      console.log(err.response.status);

      console.log("\n--- RESPONSE HEADERS ---");
      console.log(err.response.headers);
    }

    return res.status(500).send("OAuth Error");
  }
});

export default router;
