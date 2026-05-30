const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let remainingSeconds = 300;
let timerRunning = false;
let timerInterval = null;

function broadcastTimer() {
  io.emit("timerUpdate", {
    remainingSeconds,
  });
}

function startTimer() {
  if (timerRunning) return;

  timerRunning = true;

  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      broadcastTimer();
    } else {
      clearInterval(timerInterval);
      timerRunning = false;
    }
  }, 1000);
}

function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = 300;
  broadcastTimer();
}

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.emit("timerUpdate", {
    remainingSeconds,
  });

  socket.on("startTimer", () => {
    startTimer();
  });

  socket.on("pauseTimer", () => {
    pauseTimer();
  });

  socket.on("resetTimer", () => {
    resetTimer();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});