const { CronJob } = require("cron");
const { Message, ArchivedMessage, sequelize } = require("../models");
const { Op } = require("sequelize");

// Function to archive old messages
async function archiveOldMessages() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Find messages older than 1 day
      const oldMessages = await Message.findAll({
        where: {
          createdAt: {
            [Op.lt]: oneDayAgo,
          },
        },
        transaction: t,
      });

      if (oldMessages.length === 0) {
        console.log("No messages to archive");
        return;
      }

      // Prepare messages for archiving
      const messagesToArchive = oldMessages.map((msg) => ({
        content: msg.content,
        messageType: msg.messageType,
        contentType: msg.contentType,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        groupId: msg.groupId,
        originalCreatedAt: msg.createdAt,
        originalMessageId: msg.id,
      }));

      // Archive messages
      await ArchivedMessage.bulkCreate(messagesToArchive, { transaction: t });

      // Delete archived messages from the main table
      const messageIds = oldMessages.map((msg) => msg.id);
      await Message.destroy({
        where: {
          id: messageIds,
        },
        transaction: t,
      });

      console.log(`Archived ${oldMessages.length} messages`);
    });
  } catch (error) {
    console.error("Error archiving messages:", error);
  }
}

// Create a cron job that runs at midnight every day
const messageArchiverJob = new CronJob(
  "0 0 * * *", // Runs at midnight (00:00)
  archiveOldMessages,
  null,
  false,
  "UTC"
);

module.exports = messageArchiverJob;
