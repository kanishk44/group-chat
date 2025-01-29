const express = require("express");
const {
  getDirectMessages,
  sendDirectMessage,
} = require("../controllers/messageController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.get("/messages/:userId", authenticateToken, getDirectMessages);
router.post("/messages/:userId", authenticateToken, sendDirectMessage);

module.exports = router;
