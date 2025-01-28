const Message = require("../models/message");
const User = require("../models/user");
const { Op } = require("sequelize");

// Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id; // Get sender ID from the token

  try {
    const message = await Message.create({ senderId, receiverId, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  const userId = req.user.id; // Access user ID after confirming req.user exists
  const lastMessageId = req.query.lastMessageId; // Get last message ID from query

  try {
    const messages = await Message.findAll({
      where: {
        ...(lastMessageId && { id: { [Op.gt]: lastMessageId } }), // Fetch messages newer than lastMessageId
      },
      include: [
        { model: User, as: "sender" }, // Include sender details
        { model: User, as: "receiver" }, // Include receiver details
      ],
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error); // Log the error
    res.status(500).json({ message: "Server error" });
  }
};

// Get online users (dummy implementation)
exports.getOnlineUsers = async (req, res) => {
  // This should ideally check the session or a real-time service
  const onlineUsers = await User.findAll(); // Replace with actual online user logic
  res.json(onlineUsers);
};
