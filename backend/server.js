const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const color = require("randomcolor");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    // origin: "http://localhost:5173",
    credentials: true,
  },
});

users = {};

// Socket.io event handlers
io.on("connection", (socket) => {
  // on user added
  socket.on("new-user-added", (name) => {
    users[socket.id] = {
      name: name,
      color: color.randomColor({
        luminosity: "bright",
      }),
    };
    console.log(users);
    socket.broadcast.emit("user-added", name);
  });

  // on sending message
  socket.on("send-message", (message) => {
    socket.broadcast.emit("receive-message", {
      msg: message,
      user: users[socket.id],
    });
  });

  // getting the users names
  socket.on("make-users-arr", () => {
    let user_arr = Object.values(users);
    socket.broadcast.emit("get-users", user_arr);
  });

  // getting the users names for new user
  socket.on("make-users-arr-for-new", () => {
    let user_arr = Object.values(users);
    socket.emit("get-users", user_arr);
  });

  // on user quits
  socket.on("disconnect", () => {
    socket.broadcast.emit("left-message", users[socket.id]);
    delete users[socket.id];
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("People");
});

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server started at http://localhost:" + PORT);
});
