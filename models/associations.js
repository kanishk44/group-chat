function setupAssociations(models) {
  const { User, Group, GroupMember } = models;

  // User associations
  User.belongsToMany(Group, {
    through: GroupMember,
    foreignKey: "userId",
    otherKey: "groupId",
    as: "Groups",
  });

  // Group associations
  Group.belongsTo(User, { foreignKey: "adminId", as: "admin" });
  Group.belongsToMany(User, {
    through: GroupMember,
    foreignKey: "groupId",
    otherKey: "userId",
    as: "members",
  });
}

module.exports = setupAssociations;
