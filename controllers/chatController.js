const Message = require("../models/message");
const User = require("../models/user");
const { Op } = require("sequelize");

// Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  try {
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      messageType: "direct",
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
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  const userId = req.user.id;
  const { receiverId, lastMessageId } = req.query;

  try {
    const messages = await Message.findAll({
      where: {
        messageType: "direct",
        ...(lastMessageId && { id: { [Op.gt]: lastMessageId } }), // Only get messages newer than lastMessageId
        [Op.or]: [
          // Messages between the current user and the selected receiver
          {
            senderId: userId,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: userId,
          },
        ],
      },
      include: [
        { model: User, as: "sender" },
        { model: User, as: "receiver" },
      ],
      order: [["createdAt", "ASC"]], // Order messages by creation time
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get online users (dummy implementation)
exports.getOnlineUsers = async (req, res) => {
  // This should ideally check the session or a real-time service
  const onlineUsers = await User.findAll(); // Replace with actual online user logic
  res.json(onlineUsers);
};
