/****************************************************
 *  STRONG GROUP – BULLHORN ENGINE (ENV-BASED TOKENS)
 ****************************************************/
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/****************************************************
 * LOAD TOKENS FROM ENV
 ****************************************************/
function loadTokens() {
  const refreshToken = process.env.BH_REFRESH_TOKEN;
  const BhRestToken = process.env.BH_REST_TOKEN;
  const restUrl = process.env.BH_REST_URL;

  if (!refreshToken) return null;

  return { refreshToken, BhRestToken, restUrl };
}

/****************************************************
 * SAVE TOKENS BACK TO ENV (RENDER SAFE METHOD)
 ****************************************************/
function saveTokens(tokens) {
  // Render does NOT allow dynamic ENV writes at runtime.
  // BUT we CAN hold the refreshed tokens in process.env 
  // AND the GPT login flow will re-auth when needed.

  process.env.BH_REFRESH_TOKEN = tokens.refreshToken;
  process.env.BH_REST_TOKEN = tokens.BhRestToken;
  process.env.BH_REST_URL = tokens.restUrl;

  console.log("✅ Tokens updated in memory.");
}

/****************************************************
 * REFRESH REST TOKEN USING REFRESH TOKEN
 ****************************************************/
async function refreshRestToken(refreshToken) {
  const url = "https://auth.bullhornstaffing.com/oauth/token";

  const params = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  };

  const { data } = await axios.post(url, null, { params });
  return data;
}

/****************************************************
 * MAIN TOKEN MANAGER
 ****************************************************/
export async function getBullhornRestToken() {
  let tokens = loadTokens();

  if (!tokens || !tokens.refreshToken) {
    throw new Error("No tokens found. Please run /auth/start first.");
  }

  try {
    console.log("🔄 Refreshing Bullhorn session…");

    // Step 1: Refresh OAuth tokens
    const refreshed = await refreshRestToken(tokens.refreshToken);

    // Step 2: Login to Bullhorn REST
    const loginUrl = `https://rest.bullhornstaffing.com/rest-services/login?version=*&access_token=${refreshed.access_token}`;
    const { data: loginData } = await axios.get(loginUrl);

    tokens = {
      refreshToken: refreshed.refresh_token,
      BhRestToken: loginData.BhRestToken,
      restUrl: loginData.restUrl.endsWith("/")
        ? loginData.restUrl
        : loginData.restUrl + "/",
    };

    // Save to memory (Render resets, but session is okay)
    saveTokens(tokens);

    return tokens;
  } catch (err) {
    console.error("Token refresh failed:", err.response?.data || err.message);
    throw new Error("Bullhorn token refresh failed");
  }
}

/****************************************************
 * EXPRESS MIDDLEWARE
 ****************************************************/
export async function ensureSession(req, res, next) {
  try {
    const tokens = await getBullhornRestToken();

    if (!tokens?.BhRestToken || !tokens?.restUrl) {
      return res.status(401).json({
        error: "No active Bullhorn session. Run /auth/start first.",
      });
    }

    req.tokens = tokens;
    next();
  } catch (err) {
    res.status(500).json({
      error: "Failed to ensure Bullhorn session",
      details: err.message,
    });
  }
}

/****************************************************
 * UNIVERSAL REQUEST HELPERS
 ****************************************************/
function buildUrl(base, path) {
  return `${base.replace(/\/?$/, "/")}${path}`;
}

export async function bullhornGet(path, tokens, params = {}) {
  const url = buildUrl(tokens.restUrl, path);
  return axios.get(url, {
    params: { ...params, BhRestToken: tokens.BhRestToken },
  });
}

export async function bullhornPost(path, tokens, payload = {}) {
  const url = buildUrl(tokens.restUrl, `${path}?BhRestToken=${tokens.BhRestToken}`);
  return axios.post(url, payload);
}

export async function bullhornPut(path, tokens, payload = {}) {
  const url = buildUrl(tokens.restUrl, `${path}?BhRestToken=${tokens.BhRestToken}`);
  return axios.put(url, payload);
}

export async function bullhornDelete(path, tokens) {
  const url = buildUrl(tokens.restUrl, `${path}?BhRestToken=${tokens.BhRestToken}`);
  return axios.delete(url);
}

export default {
  getBullhornRestToken,
  ensureSession,
  bullhornGet,
  bullhornPost,
  bullhornPut,
  bullhornDelete,
};
