const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GroupMember = sequelize.define(
  "GroupMember",
  {
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Groups",
        key: "id",
      },
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      primaryKey: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    joinDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    addedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    indexes: [
      {
        fields: ["userId", "isAdmin"],
      },
    ],
  }
);

module.exports = GroupMember;
