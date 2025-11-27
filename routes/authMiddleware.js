export const verifyApiKey = (req, res, next) => {
  // Allow health check without authentication
  if (req.path === "/ping") {
    return next();
  }

  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const key = header.replace("Bearer ", "").trim();
  if (key !== process.env.GPT_API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
};



