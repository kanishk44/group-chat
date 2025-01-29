"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Messages", "fileUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Messages", "fileUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
