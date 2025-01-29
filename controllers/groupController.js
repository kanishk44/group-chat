const { Group, User, GroupMember, Message } = require("../models");
const { Op } = require("sequelize");

// Create a new group
exports.createGroup = async (req, res) => {
  const { name, members } = req.body;
  const adminId = req.user.id;

  if (!members || members.length < 1) {
    return res.status(400).json({ error: "Minimum 2 members required" });
  }

  try {
    const group = await Group.create({ name, adminId });

    // Add admin as a member
    await GroupMember.create({ groupId: group.id, userId: adminId });

    // Add other members
    await Promise.all(
      members.map((memberId) =>
        GroupMember.create({ groupId: group.id, userId: memberId })
      )
    );

    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user's groups
exports.getUserGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Group,
          as: "Groups",
          through: { attributes: [] }, // Exclude junction table attributes
          attributes: ["id", "name"], // Only return necessary fields
        },
      ],
    });

    res.json(user.Groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Send message to group
exports.sendGroupMessage = async (req, res) => {
  const { content } = req.body;
  const groupId = req.params.id;
  const senderId = req.user.id;

  try {
    // First verify that the user is a member of the group
    const membership = await GroupMember.findOne({
      where: {
        groupId,
        userId: senderId,
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    const message = await Message.create({
      senderId,
      groupId,
      content,
      messageType: "group",
    });

    // Fetch the complete message with sender details
    const messageWithSender = await Message.findOne({
      where: { id: message.id },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name"],
        },
      ],
    });

    console.log("Created group message:", messageWithSender); // Debug log
    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error sending group message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get group messages with pagination
exports.getGroupMessages = async (req, res) => {
  const groupId = req.params.id;
  const { limit = 50 } = req.query; // Increased limit and removed lastMessageId for now

  try {
    const messages = await Message.findAll({
      where: {
        groupId,
        messageType: "group",
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: parseInt(limit),
    });

    console.log("Found group messages:", messages.length); // Debug log
    res.json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete group (admin only)
exports.deleteGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const group = await Group.findOne({
      where: { id: groupId, adminId: userId },
    });

    if (!group) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this group" });
    }

    await group.destroy();
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
