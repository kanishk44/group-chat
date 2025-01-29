const { GroupMember } = require("../models");

const verifyGroupAdmin = async (req, res, next) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const membership = await GroupMember.findOne({
      where: {
        groupId,
        userId,
        isAdmin: true,
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = verifyGroupAdmin;
