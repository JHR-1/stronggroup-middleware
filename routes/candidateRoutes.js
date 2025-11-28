import express from "express";
import { bullhornGet } from "../bullhorn.js";

const router = express.Router();

/**
 * Intelligent Bullhorn Candidate Search
 * GET /candidates/search?query=John Smith
 */
router.get("/search", async (req, res) => {
  try {
    const raw = req.query.query;
    if (!raw) {
      return res.status(400).json({ error: "Missing ?query param" });
    }

    const tokens = req.tokens;
    const parts = raw.trim().split(/\s+/);

    let query;

    if (parts.length === 1) {
      // Single-word search (first OR last OR email OR phone)
      const term = parts[0];
      query = `firstName:${term} OR lastName:${term} OR email:${term} OR phone:${term}`;
    } else if (parts.length === 2) {
      // Full name search (first + last, plus soft fallbacks)
      const [first, last] = parts;
      query = `(firstName:${first} AND lastName:${last})
               OR (firstName:${last} AND lastName:${first})
               OR (firstName:${first})
               OR (lastName:${last})`;
    } else {
      // Multi-word fallback (search all words across first/last/email)
      const orBlocks = parts.map(p => `(firstName:${p} OR lastName:${p} OR email:${p})`);
      query = orBlocks.join(" OR ");
    }

    console.log("🔍 Bullhorn search query:", query);

    const { data } = await bullhornGet(
      "search/Candidate",
      tokens,
      {
        query: query,
        fields: "id,firstName,lastName,email,phone,status",
        count: 50,
        start: 0
      }
    );

    res.json({
      total: data.total || 0,
      data: data.data || []
    });

  } catch (err) {
    console.error("Candidate search error:", err.response?.data || err.message);

    res.status(500).json({
      error: "Candidate search failed",
      details: err.response?.data || err.message
    });
  }
});


/**
 * STRICT SKILL FILTER
 * GET /candidates/skill?skillId=1234
 *
 * Returns ONLY candidates who have the exact Skill entity with the given ID.
 */
router.get("/skill", async (req, res) => {
  try {
    const skillId = req.query.skillId;

    if (!skillId) {
      return res.status(400).json({ error: "Missing ?skillId parameter" });
    }

    const tokens = req.tokens;

    const { data } = await bullhornGet(
      "query/Candidate",
      tokens,
      {
        where: `skills.id IN (${skillId})`,
        fields: "id,firstName,lastName,email,phone,status,skills",
        count: 200
      }
    );

    res.json({
      total: data.total || 0,
      data: data.data || []
    });

  } catch (err) {
    console.error("Strict skill filter error:", err.response?.data || err.message);

    res.status(500).json({
      error: "Strict skill filter failed",
      details: err.response?.data || err.message
    });
  }
});

export default router;





