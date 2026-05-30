import { useEffect, useState } from "react";
import { socket } from "../socket";

function Controller() {
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    socket.on("timerUpdate", (data) => {
      setSeconds(data.remainingSeconds);
    });

    return () => {
      socket.off("timerUpdate");
    };
  }, []);

  const startTimer = () => {
    socket.emit("startTimer");
  };

  const pauseTimer = () => {
    socket.emit("pauseTimer");
  };

  const resetTimer = () => {
    socket.emit("resetTimer");
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
      }}
    >
      <h1>Controller</h1>

      <h2
        style={{
          fontSize: "4rem",
        }}
      >
        {formatTime()}
      </h2>

      <button onClick={startTimer}>Start</button>

      <button
        onClick={pauseTimer}
        style={{ marginLeft: "10px" }}
      >
        Pause
      </button>

      <button
        onClick={resetTimer}
        style={{ marginLeft: "10px" }}
      >
        Reset
      </button>
    </div>
  );
}

export default Controller;