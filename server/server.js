// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");

// const app = express();

// app.use(cors());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// let remainingSeconds = 300;
// let timerRunning = false;
// let timerInterval = null;

// function broadcastTimer() {
//   io.emit("timerUpdate", {
//     remainingSeconds,
//   });
// }

// function startTimer() {
//   if (timerRunning) return;

//   timerRunning = true;

//   timerInterval = setInterval(() => {
//     if (remainingSeconds > 0) {
//       remainingSeconds--;
//       broadcastTimer();
//     } else {
//       clearInterval(timerInterval);
//       timerRunning = false;
//     }
//   }, 1000);
// }

// function pauseTimer() {
//   timerRunning = false;
//   clearInterval(timerInterval);
// }

// function resetTimer() {
//   pauseTimer();
//   remainingSeconds = 300;
//   broadcastTimer();
// }

// io.on("connection", (socket) => {
//   console.log("Client connected");

//   socket.emit("timerUpdate", {
//     remainingSeconds,
//   });

//   socket.on("startTimer", () => {
//     startTimer();
//   });

//   socket.on("pauseTimer", () => {
//     pauseTimer();
//   });

//   socket.on("resetTimer", () => {
//     resetTimer();
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// server.listen(3001, () => {
//   console.log("Server running on port 3001");
// });

const express = require("express");
const http    = require("http");
const cors    = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ── Server-side timer state ───────────────────────────────────────────────────
let state = {
  remainingSeconds: 300,
  totalSeconds:     300,
  running:          false,
  activeItem: {
    id:       null,
    title:    "Standby",
    speaker:  "",
    duration: "05:00",
  },
};

let timerInterval = null;

function broadcast() {
  io.emit("timerUpdate", {
    remainingSeconds: state.remainingSeconds,
    totalSeconds:     state.totalSeconds,
    activeItem:       state.activeItem,
  });
}

function startTick() {
  if (state.running) return;
  state.running = true;
  timerInterval = setInterval(() => {
    state.remainingSeconds--;           // allow negative (overtime)
    broadcast();
    if (state.remainingSeconds <= -3600) {
      clearInterval(timerInterval);
      state.running = false;
    }
  }, 1000);
}

function pauseTick() {
  state.running = false;
  clearInterval(timerInterval);
}

function resetTick() {
  pauseTick();
  state.remainingSeconds = state.totalSeconds;
  broadcast();
}

// ── Socket events ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send current state immediately on connect so viewer syncs instantly
  socket.emit("timerUpdate", {
    remainingSeconds: state.remainingSeconds,
    totalSeconds:     state.totalSeconds,
    activeItem:       state.activeItem,
  });

  socket.on("startTimer",  () => startTick());
  socket.on("pauseTimer",  () => pauseTick());
  socket.on("resetTimer",  () => resetTick());

  // Controller sends this whenever active item changes or time is adjusted
  socket.on("syncState", (payload) => {
    pauseTick();
    state.remainingSeconds = payload.remainingSeconds ?? state.remainingSeconds;
    state.totalSeconds     = payload.totalSeconds     ?? state.totalSeconds;
    state.activeItem       = payload.activeItem       ?? state.activeItem;
    broadcast();
  });

  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

server.listen(3001, () => console.log("Server running on port 3001"));