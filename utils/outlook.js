import axios from "axios";
import querystring from "querystring";
import db from "./db.js";

const tenant = process.env.MS_TENANT_ID;
const clientId = process.env.MS_CLIENT_ID;
const clientSecret = process.env.MS_CLIENT_SECRET;
const redirectUri = process.env.MS_REDIRECT_URI;

export function getOutlookAuthUrl() {
  const params = querystring.stringify({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: [
      "User.Read",
      "Mail.Read",
      "Mail.Send",
      "Mail.ReadWrite",
      "Calendars.ReadWrite",
      "offline_access"
    ].join(" "),
  });

  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeCodeForOutlookToken(code) {
  const data = {
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    client_secret: clientSecret,
  };

  const response = await axios.post(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    querystring.stringify(data),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return response.data;
}

export async function refreshOutlookToken(user) {
  const data = {
    client_id: clientId,
    refresh_token: user.outlook_refresh_token,
    redirect_uri: redirectUri,
    grant_type: "refresh_token",
    client_secret: clientSecret,
  };

  const response = await axios.post(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    querystring.stringify(data),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  await db("users")
    .where({ id: user.id })
    .update({
      outlook_access_token: response.data.access_token,
      outlook_refresh_token: response.data.refresh_token,
      outlook_expires: Date.now() + response.data.expires_in * 1000,
    });

  return response.data.access_token;
}

export async function getValidOutlookToken(user) {
  if (!user.outlook_access_token) return null;

  if (Date.now() > user.outlook_expires - 60000) {
    return await refreshOutlookToken(user);
  }

  return user.outlook_access_token;
}
