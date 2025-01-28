const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to check if the user is authenticated
const authenticateToken = (req, res, next) => {
  const token = req.headers["Authorization"]?.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      console.log("Error verifying token:", err);
      return res.redirect("/login");
    }
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
