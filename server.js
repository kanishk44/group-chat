const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const sequelize = require("./config/db");
const jwt = require("jsonwebtoken");
const path = require("path");
const GroupMember = require("./models/groupMember");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRoutes);
app.use("/", groupRoutes);
app.use("/", messageRoutes);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle joining group rooms
  socket.on("joinGroup", async (groupId) => {
    try {
      // Verify user is a member of the group
      const membership = await GroupMember.findOne({
        where: {
          groupId,
          userId: socket.userId,
        },
      });

      if (membership) {
        socket.join(`group_${groupId}`);
        console.log(`User ${socket.userId} joined group ${groupId}`);
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  });

  // Handle leaving group rooms
  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
    console.log(`User ${socket.userId} left group ${groupId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

// Export io instance to use in controllers
app.set("io", io);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

const PORT = process.env.PORT || 3000;

sequelize
  .sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
