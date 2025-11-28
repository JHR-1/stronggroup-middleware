import express from "express";
import axios from "axios";
import multer from "multer";
import { ensureSession } from "../bullhorn.js";


const upload = multer({ dest: "uploads/" });
const router = express.Router();

/******************************************************
 * UPLOAD + PARSE CV
 ******************************************************/
router.post("/parse", ensureSession, upload.single("file"), async (req, res) => {
  try {
    const tokens = req.tokens;
    const file = req.file;

    const payload = {
      externalID: file.filename,
      fileContent: Buffer.from(fs.readFileSync(file.path)).toString("base64")
    };

    const response = await bullhornPost(
      "entity/Resume/parseToCandidate",
      tokens,
      payload
    );

    res.json({
      success: true,
      candidate: response.data
    });
  } catch (err) {
    res.status(500).json({ error: "CV parse failed", details: err.response?.data });
  }
});

export default router;
