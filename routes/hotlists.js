import express from "express";
import axios from "axios";
import { ensureSession } from "../bullhorn.js";


const router = express.Router();

/******************************************************
 * GET ALL HOTLISTS
 ******************************************************/
router.get("/", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;

    const response = await bullhornGet("query/HotList", tokens, {
      where: "isDeleted = false",
      fields: "id,name,description,dateAdded"
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hotlists", details: err.response?.data });
  }
});

/******************************************************
 * GET HOTLIST MEMBERS
 ******************************************************/
router.get("/:id/members", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { id } = req.params;

    const response = await bullhornGet("query/HotListMember", tokens, {
      where: `hotList.id=${id}`,
      fields: "id,candidate(id,firstName,lastName,email,phone)"
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to get members", details: err.response?.data });
  }
});

/******************************************************
 * ADD MEMBER
 ******************************************************/
router.post("/:id/add", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { id } = req.params;
    const { candidateId } = req.body;

    const payload = {
      hotList: { id },
      candidate: { id: candidateId }
    };

    const response = await bullhornPut("entity/HotListMember", tokens, payload);

    res.json({ success: true, added: response.data });
  } catch (err) {
    res.status(500).json({ error: "Failed to add member", details: err.response?.data });
  }
});

/******************************************************
 * REMOVE MEMBER
 ******************************************************/
router.delete("/:id/remove/:candidateId", ensureSession, async (req, res) => {
  try {
    const tokens = req.tokens;
    const { id, candidateId } = req.params;

    const response = await bullhornDelete(`entity/HotListMember/${candidateId}`, tokens);

    res.json({ success: true, removed: response.data });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove member", details: err.response?.data });
  }
});

export default router;
