const express = require("express");
const {
  createGroup,
  getUserGroups,
  sendGroupMessage,
  getGroupMessages,
  deleteGroup,
  addMembers,
  removeMembers,
  updateAdminStatus,
  searchMembers,
} = require("../controllers/groupController");
const authenticateToken = require("../middleware/auth");
const verifyGroupMembership = require("../middleware/verifyGroupMembership");
const verifyGroupAdmin = require("../middleware/verifyGroupAdmin");
const User = require("../models/user");
const { Op } = require("sequelize");

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
router.delete("/groups/:id", authenticateToken, verifyGroupAdmin, deleteGroup);

router.put(
  "/groups/:id/members",
  authenticateToken,
  verifyGroupAdmin,
  addMembers
);
router.delete(
  "/groups/:id/members",
  authenticateToken,
  verifyGroupAdmin,
  removeMembers
);
router.put(
  "/groups/:id/admins",
  authenticateToken,
  verifyGroupAdmin,
  updateAdminStatus
);
router.get(
  "/groups/:id/members",
  authenticateToken,
  verifyGroupMembership,
  searchMembers
);

router.get("/users/search", authenticateToken, async (req, res) => {
  const { searchTerm } = req.query;
  const currentUserId = req.user.id;

  try {
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId }, // Exclude current user
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      attributes: ["id", "name", "email"], // Only return necessary fields
    });
    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name"],
      where: {
        id: { [Op.ne]: req.user.id }, // Exclude current user
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
