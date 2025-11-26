import axios from "axios";
import { getBullhornRestToken } from "../bullhorn.js";

/**
 * Log activity into Bullhorn (SMS or Email)
 */
async function logActivity(personId, message, type = "SMS") {
  try {
    const { BhRestToken, restUrl } = await getBullhornRestToken();

    const activityBody = {
      action: type === "SMS" ? "Text Message" : "Email",
      comments: message,
      personReference: { id: personId, type: "Candidate" },
    };

    await axios.post(
      `${restUrl}entity/Note?BhRestToken=${BhRestToken}`,
      activityBody
    );

  } catch (err) {
    console.error("Activity log failed:", err.response?.data || err);
  }
}

/**
 * Send SMS (Bullhorn built-in SMS)
 */
export async function sendSMS(personId, message) {
  const { BhRestToken, restUrl } = await getBullhornRestToken();

  const payload = {
    personId,
    message,
  };

  const response = await axios.post(
    `${restUrl}services/message/sendSMS?BhRestToken=${BhRestToken}`,
    payload
  );

  // Log SMS activity
  await logActivity(personId, message, "SMS");

  return response.data;
}

/**
 * Send Email
 */
export async function sendEmail(personId, subject, body) {
  const { BhRestToken, restUrl } = await getBullhornRestToken();

  const payload = {
    personId,
    subject,
    body,
  };

  const response = await axios.post(
    `${restUrl}services/message/sendEmail?BhRestToken=${BhRestToken}`,
    payload
  );

  // Log Email activity
  await logActivity(personId, `${subject}\n\n${body}`, "Email");

  return response.data;
}
