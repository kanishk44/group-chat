const GroupMember = require("../models/groupMember");

const verifyGroupMembership = async (req, res, next) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const membership = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = verifyGroupMembership;
