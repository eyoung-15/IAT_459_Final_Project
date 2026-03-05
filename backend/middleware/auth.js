const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // 1. Get the token from the header
  const token = req.header("Authorization");

  // 2. Check if token exists
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    // 3. Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.id; // Attach user info to the request
    next(); // Let them pass
  } catch (error) {
    res.status(401).json({ error: "Invalid Token" });
  }
}

module.exports = verifyToken;