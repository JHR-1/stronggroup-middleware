/****************************************************
 *  STRONG GROUP – UNIFIED BULLHORN ENGINE
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
    const data = fs.readFileSync(TOKEN_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

/****************************************************
 * BULLHORN AUTH – LOGIN + REFRESH
 ****************************************************/
async function loginToBullhorn() {
  const url = "https://auth.bullhornstaffing.com/oauth/token";

  const body = {
    grant_type: "password",
    username: process.env.BH_USERNAME,
    password: process.env.BH_PASSWORD,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  };

  const response = await axios.post(url, body);
  return response.data;
}

async function refreshRestToken(refreshToken) {
  const url = `https://auth.bullhornstaffing.com/oauth/token?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;

  const response = await axios.get(url);
  return response.data;
}

/****************************************************
 * MAIN TOKEN MANAGER (called by every route)
 ****************************************************/
export async function getBullhornRestToken() {
  let tokens = loadTokens();

  // FIRST LOGIN — no tokens.json exists
  if (!tokens || !tokens.refreshToken) {
    console.log("🔐 First login… requesting new Bullhorn tokens");

    const loginData = await loginToBullhorn();
    const restData = await refreshRestToken(loginData.refresh_token);

    tokens = {
      refreshToken: loginData.refresh_token,
      BhRestToken: restData.BhRestToken,
      restUrl: restData.restUrl,
    };

    saveTokens(tokens);
    return tokens;
  }

  // REFRESH TOKEN
  console.log("🔄 Refreshing Bullhorn session…");

  const refreshed = await refreshRestToken(tokens.refreshToken);

  tokens.BhRestToken = refreshed.BhRestToken;
  tokens.restUrl = refreshed.restUrl;

  saveTokens(tokens);

  return tokens;
}

/****************************************************
 * EXPRESS MIDDLEWARE — Ensure session is active
 ****************************************************/
export async function ensureSession(req, res, next) {
  try {
    const tokens = await getBullhornRestToken();

    if (!tokens || !tokens.BhRestToken || !tokens.restUrl) {
      return res.status(401).json({
        error: "No active Bullhorn session. Run /auth/start first."
      });
    }

    req.tokens = tokens;
    next();

  } catch (err) {
    console.error("Session error:", err);
    return res.status(500).json({
      error: "Failed to ensure Bullhorn session",
      details: err.message
    });
  }
}

/****************************************************
 * UNIVERSAL BULLHORN API CALLER  
 * Example: await bullhornGet("entity/Candidate/123");
 ****************************************************/
export async function bullhornGet(path, tokens, params = {}) {
  const url = `${tokens.restUrl}${path}`;
  return axios.get(url, {
    params: {
      ...params,
      BhRestToken: tokens.BhRestToken,
    },
  });
}

export async function bullhornPost(path, tokens, payload = {}) {
  const url = `${tokens.restUrl}${path}?BhRestToken=${tokens.BhRestToken}`;
  return axios.post(url, payload);
}

export async function bullhornPut(path, tokens, payload = {}) {
  const url = `${tokens.restUrl}${path}?BhRestToken=${tokens.BhRestToken}`;
  return axios.put(url, payload);
}

export async function bullhornDelete(path, tokens) {
  const url = `${tokens.restUrl}${path}?BhRestToken=${tokens.BhRestToken}`;
  return axios.delete(url);
}

/****************************************************
 * EXPORT DEFAULT (required by old routes)
 ****************************************************/
export default {
  getBullhornRestToken,
  ensureSession,
  bullhornGet,
  bullhornPost,
  bullhornPut,
  bullhornDelete
};
