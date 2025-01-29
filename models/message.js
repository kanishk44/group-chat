const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user"); // Import User model
const Group = require("./group");

const Message = sequelize.define("Message", {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for group messages
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for direct messages
    references: {
      model: "Groups",
      key: "id",
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  messageType: {
    type: DataTypes.ENUM("direct", "group"),
    defaultValue: "direct",
  },
});

// Define associations
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });
Message.belongsTo(Group, { foreignKey: "groupId", as: "group" });

module.exports = Message;
