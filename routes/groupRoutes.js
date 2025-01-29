const express = require("express");
const {
  createGroup,
  getUserGroups,
  sendGroupMessage,
  getGroupMessages,
  deleteGroup,
} = require("../controllers/groupController");
const authenticateToken = require("../middleware/auth");
const verifyGroupMembership = require("../middleware/verifyGroupMembership");

const router = express.Router();

router.post("/groups", authenticateToken, createGroup);
router.get("/groups", authenticateToken, getUserGroups);
router.post(
  "/groups/:id/messages",
  authenticateToken,
  verifyGroupMembership,
  sendGroupMessage
);
router.get(
  "/groups/:id/messages",
  authenticateToken,
  verifyGroupMembership,
  getGroupMessages
);
router.delete(
  "/groups/:id",
  authenticateToken,
  verifyGroupMembership,
  deleteGroup
);

module.exports = router;
