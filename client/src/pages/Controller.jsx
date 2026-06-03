// client/src/pages/Controller.jsx
import { useState } from "react";
import LeftSidebar from "../components/LeftSidebar";

export default function Controller() {
  const [activeId, setActiveId] = useState(2); // item 2 is "playing" by default

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0b" }}>
      <LeftSidebar activeId={activeId} onSelect={(id) => setActiveId(id)} />

      {/* Timer and RightSidebar will be added here next */}
      <main style={{ flex: 1, display: "flex", alignItems: "center",
                     justifyContent: "center", color: "#f0f0f0" }}>
        Timer goes here
      </main>
    </div>
  );
}