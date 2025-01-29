"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Messages", "contentType", {
      type: Sequelize.ENUM("text", "file"),
      defaultValue: "text",
      allowNull: false,
    });

    await queryInterface.addColumn("Messages", "fileUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Messages", "fileName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Messages", "fileName");
    await queryInterface.removeColumn("Messages", "fileUrl");
    await queryInterface.removeColumn("Messages", "contentType");
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_Messages_contentType;"
    );
  },
};
