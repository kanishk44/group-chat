const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ArchivedMessage = sequelize.define("ArchivedMessage", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  messageType: {
    type: DataTypes.ENUM("direct", "group"),
    allowNull: false,
  },
  contentType: {
    type: DataTypes.ENUM("text", "file"),
    defaultValue: "text",
  },
  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  originalCreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  originalMessageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = ArchivedMessage;
