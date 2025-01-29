const User = require("./user");
const Group = require("./group");
const GroupMember = require("./groupMember");
const Message = require("./message");
const setupAssociations = require("./associations");

const models = {
  User,
  Group,
  GroupMember,
  Message,
};

setupAssociations(models);

module.exports = models;
