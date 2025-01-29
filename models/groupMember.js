const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GroupMember = sequelize.define("GroupMember", {
  groupId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Groups",
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Users",
      key: "id",
    },
  },
  joinDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = GroupMember;
