import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";


const router = express.Router();

/******************************************************
 * SEARCH CONTACTS
 ******************************************************/
router.get("/search", ensureSession, async (req, res) => {
  try {
    const { query } = req.query;
    const tokens = req.tokens;

    const response = await bullhornGet("search/ClientContact", tokens, {
      query,
      fields: "id,firstName,lastName,email,phone,clientCorporation",
    });

    res.json(response.data);
  } catch (err) {
    console.error("Contact search error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to search contacts",
      details: err.response?.data,
    });
  }
});

/******************************************************
 * GET CONTACT BY ID
 ******************************************************/
router.get("/:id", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { id } = req.params;

    const response = await bullhornGet(
      `entity/ClientContact/${id}`,
      tokens,
      { fields: "*" }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Get contact error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to get contact",
      details: err.response?.data,
    });
  }
});

/******************************************************
 * GET COMPANY
 ******************************************************/
router.get("/company/:id", ensureSession, async (req, res) => {
  try {
    const { id } = req.params;
    const tokens = req.tokens;

    const response = await bullhornGet(
      `entity/ClientCorporation/${id}`,
      tokens,
      { fields: "*" }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Company fetch error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch company",
      details: err.response?.data,
    });
  }
});

/******************************************************
 * CREATE CONTACT
 ******************************************************/
router.post("/create", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const payload = req.body;

    const response = await bullhornPut("entity/ClientContact", tokens, payload);

    res.json({
      success: true,
      contactId: response.data.changedEntityId,
      raw: response.data,
    });
  } catch (err) {
    console.error("Create contact error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to create contact",
      details: err.response?.data,
    });
  }
});

export default router;

