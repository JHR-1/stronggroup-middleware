import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";

const router = express.Router();

// GET all departments (Client Corporations)
router.get("/", ensureSession, async (req, res) => {
  try {
    const { BhRestToken, restUrl } = req.tokens;

    const url = `${restUrl}query/ClientCorporation?where=id>0&BhRestToken=${BhRestToken}`;

    const response = await axios.get(url);

    res.json(response.data);
  } catch (err) {
    console.error("Department Error:", err.response?.data || err.message);

    res.status(500).json({
      error: "Failed to fetch departments",
      details: err.response?.data,
    });
  }
});

export default router;
