const { Message, User } = require("../models");
const { Op } = require("sequelize");
const { getSignedUrl } = require("../config/s3");

// Get direct messages between two users
exports.getDirectMessages = async (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.params.userId;

  try {
    const messages = await Message.findAll({
      where: {
        messageType: "direct",
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching direct messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Send direct message
exports.sendDirectMessage = async (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.params.userId;
  const { content } = req.body;

  try {
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      messageType: "direct",
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

    // Emit the message to both sender and receiver
    const io = req.app.get("io");
    io.to(`user_${senderId}`)
      .to(`user_${receiverId}`)
      .emit("directMessage", messageWithSender);

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error sending direct message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add file upload handler for direct messages
exports.uploadDirectFile = async (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.params.userId;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content: req.file.originalname,
      contentType: "file",
      fileUrl: getSignedUrl(req.file.key),
      fileName: req.file.originalname,
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
      ],
    });

    // Emit the message to both sender and receiver
    const io = req.app.get("io");
    io.to(`user_${senderId}`)
      .to(`user_${receiverId}`)
      .emit("directMessage", messageWithSender);

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};
