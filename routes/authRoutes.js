import express from "express";
const router = express.Router();

// AUTH: START BULLHORN LOGIN
router.get("/start", async (req, res) => {
  try {
    const authUrl = process.env.BH_AUTH_URL; // you already had this logic
    res.redirect(authUrl);
  } catch (err) {
    console.error("Auth start error:", err);
    res.status(500).json({ error: "Auth start failed" });
  }
});

// AUTH: BULLHORN CALLBACK
router.get("/callback", async (req, res) => {
  try {
    // your existing logic for saving tokens goes here
    res.send("OAuth Success! Tokens stored.");
  } catch (err) {
    console.error("Auth callback error:", err);
    res.status(500).json({ error: "Callback failed" });
  }
});

export default router;


