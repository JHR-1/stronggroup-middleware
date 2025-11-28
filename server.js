import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { verifyApiKey } from "./routes/authMiddleware.js";
import { ensureSession } from "./bullhorn.js";

const app = express();
app.use(express.json());

/******************************************************
 * 1) PUBLIC AUTH ROUTES — MUST COME FIRST
 ******************************************************/
import authRoutes from "./routes/authRoutes.js";
app.use("/auth", authRoutes);   // Public

/******************************************************
 * 1.5) PUBLIC OUTLOOK ROUTES — MUST BE BEFORE API KEY CHECK
 ******************************************************/
import outlookRoutes from "./routes/outlookRoutes.js";
app.use("/outlook", outlookRoutes);  // Public

/******************************************************
 * 2) API KEY PROTECTION — EVERYTHING AFTER THIS IS LOCKED
 ******************************************************/
app.use(verifyApiKey);

/******************************************************
 * 3) PUBLIC HEALTH CHECKS
 ******************************************************/
app.get("/ping", (req, res) => res.json({ message: "pong" }));
app.get("/__ping", (req, res) => res.send("pong"));

/******************************************************
 * 4) BULLHORN SESSION CHECK
 ******************************************************/
app.use(ensureSession);

/******************************************************
 * 5) PROTECTED API ROUTES
 ******************************************************/
import commsRoutes from "./routes/commsRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import hotlistRoutes from "./routes/hotlists.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import placementRoutes from "./routes/placementRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import utilRoutes from "./routes/utilRoutes.js";

app.use("/comms", commsRoutes);
app.use("/candidates", candidateRoutes);
app.use("/jobs", jobRoutes);
app.use("/contacts", contactRoutes);
app.use("/hotlists", hotlistRoutes);
app.use("/departments", departmentRoutes);
app.use("/files", fileRoutes);
app.use("/notes", noteRoutes);
app.use("/placements", placementRoutes);
app.use("/skills", skillRoutes);
app.use("/statuses", statusRoutes);
app.use("/submissions", submissionRoutes);
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/util", utilRoutes);

/******************************************************
 * START SERVER
 ******************************************************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`StrongGroup Middleware running on ${PORT}`)
);











