const express = require("express");
const {
  getDirectMessages,
  sendDirectMessage,
  uploadDirectFile,
} = require("../controllers/messageController");
const authenticateToken = require("../middleware/auth");
const { upload } = require("../config/s3");

const router = express.Router();

router.get("/messages/:userId", authenticateToken, getDirectMessages);
router.post("/messages/:userId", authenticateToken, sendDirectMessage);

// Add file upload route for direct messages
router.post(
  "/messages/:userId/files",
  authenticateToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  uploadDirectFile
);

module.exports = router;
