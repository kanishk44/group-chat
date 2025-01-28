const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to check if the user is authenticated
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  //console.log("Token received in middleware:", token);

  if (!token) {
    console.log("No token provided");
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Error verifying token:", err);
      return res.status(403).json({ error: "Token is not valid" });
    }
    console.log("Authenticated user:", user);
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
