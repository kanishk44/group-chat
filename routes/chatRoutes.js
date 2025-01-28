const express = require("express");
const {
  sendMessage,
  getMessages,
  getOnlineUsers,
} = require("../controllers/chatController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/messages", authenticateToken, sendMessage);
router.get("/messages", authenticateToken, getMessages);
router.get("/online-users", authenticateToken, getOnlineUsers);

module.exports = router;
