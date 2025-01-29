const { Group, User, GroupMember, Message } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/db");
const { upload, getSignedUrl } = require("../config/s3");

// Create a new group
exports.createGroup = async (req, res) => {
  const { name, members } = req.body;
  const adminId = req.user.id;

  if (!members || members.length < 1) {
    return res.status(400).json({ error: "Minimum 2 members required" });
  }

  try {
    const group = await Group.create({ name, adminId });

    // Add admin as a member with isAdmin true
    await GroupMember.create({
      groupId: group.id,
      userId: adminId,
      isAdmin: true, // Set creator as admin
    });

    // Add other members
    await Promise.all(
      members.map((memberId) =>
        GroupMember.create({
          groupId: group.id,
          userId: memberId,
          isAdmin: false, // Other members are not admins by default
        })
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
      contentType: "text",
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

    // Emit the message to all group members
    const io = req.app.get("io");
    io.to(`group_${groupId}`).emit("groupMessage", messageWithSender);

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

// Add members to group
exports.addMembers = async (req, res) => {
  const groupId = req.params.id;
  const { userIds } = req.body;
  const adminId = req.user.id;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "Invalid user list" });
  }

  try {
    // Start transaction for bulk operations
    await sequelize.transaction(async (t) => {
      // Check if users already exist in group
      const existingMembers = await GroupMember.findAll({
        where: {
          groupId,
          userId: userIds,
        },
        transaction: t,
      });

      const existingUserIds = existingMembers.map((m) => m.userId);
      const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

      // Add new members
      await Promise.all(
        newUserIds.map((userId) =>
          GroupMember.create(
            {
              groupId,
              userId,
              addedBy: adminId,
            },
            { transaction: t }
          )
        )
      );
    });

    res.json({ message: "Members added successfully" });
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove members from group
exports.removeMembers = async (req, res) => {
  const groupId = req.params.id;
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: "Invalid user list" });
  }

  try {
    await GroupMember.destroy({
      where: {
        groupId,
        userId: userIds,
        isAdmin: false, // Prevent removing admins through this endpoint
      },
    });

    res.json({ message: "Members removed successfully" });
  } catch (error) {
    console.error("Error removing members:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update admin status
exports.updateAdminStatus = async (req, res) => {
  const groupId = req.params.id;
  const { userId, action } = req.body;

  if (!userId || !["promote", "demote"].includes(action)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    await member.update({ isAdmin: action === "promote" });
    res.json({ message: `User ${action}d to admin successfully` });
  } catch (error) {
    console.error("Error updating admin status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Search group members
exports.searchMembers = async (req, res) => {
  const groupId = req.params.id;
  const { searchTerm } = req.query;

  try {
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone"],
          where: searchTerm
            ? {
                [Op.or]: [
                  { name: { [Op.like]: `%${searchTerm}%` } },
                  { email: searchTerm },
                  { phone: searchTerm },
                ],
              }
            : undefined,
        },
      ],
      attributes: ["isAdmin", "joinDate"],
    });

    // Transform the response to match the expected format
    const formattedMembers = members.map((member) => ({
      isAdmin: member.isAdmin,
      joinDate: member.joinDate,
      User: member.User,
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error("Error searching members:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add this new route handler for file uploads
exports.uploadGroupFile = async (req, res) => {
  const groupId = req.params.id;
  const senderId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

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
      content: req.file.originalname,
      contentType: "file",
      fileUrl: getSignedUrl(req.file.key),
      fileName: req.file.originalname,
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

    // Emit the message to all group members
    const io = req.app.get("io");
    io.to(`group_${groupId}`).emit("groupMessage", messageWithSender);

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};
