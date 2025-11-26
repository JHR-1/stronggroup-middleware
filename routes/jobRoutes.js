import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";

const router = express.Router();

/**
 * SEARCH JOBS
 * GET /jobs/search?query=title:Electrician
 */
router.get("/search", ensureSession, async (req, res) => {
  try {
    const { query } = req.query;
    const { BhRestToken, restUrl } = req.tokens;

    const response = await axios.get(`${restUrl}search/JobOrder`, {
      params: {
        BhRestToken,
        query
      },
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: "Job search failed",
      details: err.response?.data || err.message
    });
  }
});

/**
 * GET JOB BY ID
 */
router.get("/:id", ensureSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { BhRestToken, restUrl } = req.tokens;

    const response = await axios.get(
      `${restUrl}entity/JobOrder/${id}?fields=*&BhRestToken=${BhRestToken}`
    );

    res.json(response.data.data);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch job",
      details: err.response?.data || err.message
    });
  }
});

/**
 * CREATE JOB
 */
router.post("/create", ensureSession, async (req, res) => {
  try {
    const {
      title,
      description,
      employmentType,
      clientCompanyID,
      clientContactID,
      location,
      categoryID,
      ownerID,
      salary,
      payRate,
      startDate,
      endDate,
      weeklyHours,
      shiftPattern
    } = req.body;

    const { BhRestToken, restUrl } = req.tokens;

    const payload = {
      title,
      description,
      clientCorporation: { id: clientCompanyID },
      clientContact: { id: clientContactID },
      address: { city: location || "Unknown" },
      category: { id: categoryID },
      owner: { id: ownerID },
      employmentType,
      status: "Open",
      isOpen: true,
    };

    if (employmentType === "Perm") {
      payload.salary = salary;
      payload.salaryUnit = "Yearly";
    }

    if (employmentType === "Contract") {
      payload.payRate = payRate;
      payload.startDate = startDate;
      payload.endDate = endDate;
      payload.hoursPerWeek = weeklyHours;
      payload.shift = shiftPattern;
    }

    const response = await axios.put(
      `${restUrl}entity/JobOrder?BhRestToken=${BhRestToken}`,
      payload
    );

    res.json({
      success: true,
      jobID: response.data.changedEntityId,
      rawResponse: response.data
    });
  } catch (err) {
    res.status(500).json({
      error: "Job creation failed",
      details: err.response?.data || err.message
    });
  }
});

/**
 * ADD NOTE TO JOB
 */
router.post("/:id/note", ensureSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const { BhRestToken, restUrl } = req.tokens;

    const payload = {
      action: "Job Update",
      comments: note,
      jobOrder: { id }
    };

    const response = await axios.put(
      `${restUrl}entity/Note?BhRestToken=${BhRestToken}`,
      payload
    );

    res.json({
      success: true,
      noteID: response.data.changedEntityId
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to add job note",
      details: err.response?.data || err.message
    });
  }
});

export default router;
