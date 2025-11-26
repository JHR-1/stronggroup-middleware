/****************************************************
 *  STRONG GROUP – UNIFIED BULLHORN ENGINE (FIXED)
 ****************************************************/
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

/****************************************************
 * TOKEN FILE HANDLING
 ****************************************************/
const TOKEN_FILE = "tokens.json";

function loadTokens() {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
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
 * MAIN TOKEN MANAGER (CALLED BY EVERY ROUTE)
 ****************************************************/
export async function getBullhornRestToken() {
  let tokens = loadTokens();

  if (!tokens || !tokens.refreshToken) {
    throw new Error("No tokens found. Please run /auth/start first.");
  }

  try {
    console.log("🔄 Refreshing Bullhorn session…");

    // Step 1: Refresh OAuth token
    const refreshed = await refreshRestToken(tokens.refreshToken);

    // Step 2: Log into REST services
    const loginUrl = `https://rest.bullhornstaffing.com/rest-services/login?version=*&access_token=${refreshed.access_token}`;
    const { data: loginData } = await axios.get(loginUrl);

    tokens = {
      refreshToken: refreshed.refresh_token,
      BhRestToken: loginData.BhRestToken,
      restUrl: loginData.restUrl.endsWith("/")
        ? loginData.restUrl
        : loginData.restUrl + "/",
    };

    saveTokens(tokens);
    return tokens;
  } catch (err) {
    console.error("Token refresh failed:", err.response?.data || err.message);
    throw new Error("Bullhorn token refresh failed");
  }
}

/****************************************************
 * EXPRESS MIDDLEWARE — Ensure session is active
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
    console.error("Session error:", err);
    res.status(500).json({
      error: "Failed to ensure Bullhorn session",
      details: err.message,
    });
  }
}

/****************************************************
 * UNIVERSAL API CALLERS — FIXED URL BUILDER
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

/****************************************************
 * EXPORT DEFAULT
 ****************************************************/
export default {
  getBullhornRestToken,
  ensureSession,
  bullhornGet,
  bullhornPost,
  bullhornPut,
  bullhornDelete,
};
