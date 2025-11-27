export const verifyApiKey = (req, res, next) => {
  // Public routes: no API key required
  if (
    req.path === "/ping" ||
    req.path === "/auth/start" ||
    req.path === "/auth/callback"
  ) {
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




