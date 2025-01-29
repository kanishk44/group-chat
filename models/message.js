const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Message = sequelize.define("Message", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  messageType: {
    type: DataTypes.ENUM("direct", "group"),
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null for group messages
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null for direct messages
  },
});

module.exports = Message;
