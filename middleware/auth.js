const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" })
    }
    res.status(401).json({ message: "Invalid token, authorization denied" })
  }
}

module.exports = auth