const User = require("./user");
const Group = require("./group");
const GroupMember = require("./groupMember");
const Message = require("./message");
const ArchivedMessage = require("./archivedMessage");
const setupAssociations = require("./associations");

const models = {
  User,
  Group,
  GroupMember,
  Message,
  ArchivedMessage,
};

setupAssociations(models);

module.exports = models;
