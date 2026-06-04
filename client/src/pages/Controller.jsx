// // client/src/pages/Controller.jsx
// import { useState } from "react";
// import LeftSidebar from "../components/LeftSidebar";

// export default function Controller() {
//   const [activeId, setActiveId] = useState(2); // item 2 is "playing" by default

//   return (
//     <div style={{ display: "flex", height: "100vh", background: "#0a0a0b" }}>
//       <LeftSidebar activeId={activeId} onSelect={(id) => setActiveId(id)} />

//       {/* Timer and RightSidebar will be added here next */}
//       <main style={{ flex: 1, display: "flex", alignItems: "center",
//                      justifyContent: "center", color: "#f0f0f0" }}>
//         Timer goes here
//       </main>
//     </div>
//   );
// }

import { useState } from "react";
import { socket } from "../socket";
import LeftSidebar  from "../components/LeftSidebar";
import TimerStage   from "../components/TimerStage";
import RightSidebar from "../components/RightSidebar";

// Default rundown — move to a shared store (Zustand / Context) when ready
const DEFAULT_ITEMS = [
  { id: 1, title: "Pre-show & Welcome",    speaker: "Emcee",          duration: "10:00" },
  { id: 2, title: "Opening Keynote",       speaker: "Priya Mehta",    duration: "35:00" },
  { id: 3, title: "Product Demo — Core",   speaker: "Dev Team",       duration: "20:00" },
  { id: 4, title: "Panel: Growth & Scale", speaker: "4 panelists",    duration: "45:00" },
  { id: 5, title: "Break",                 speaker: "",               duration: "15:00" },
  { id: 6, title: "Fireside Chat",         speaker: "CEO × Reporter", duration: "30:00" },
  { id: 7, title: "Audience Q&A",          speaker: "All speakers",   duration: "25:00" },
  { id: 8, title: "Closing Remarks",       speaker: "Priya Mehta",    duration: "05:00" },
];

export default function Controller() {
  const [items,    setItems]    = useState(DEFAULT_ITEMS);
  const [activeId, setActiveId] = useState(2);

  const handleNext = () => {
    const idx = items.findIndex(it => it.id === activeId);
    if (idx < items.length - 1) setActiveId(items[idx + 1].id);
  };

  const handlePrev = () => {
    const idx = items.findIndex(it => it.id === activeId);
    if (idx > 0) setActiveId(items[idx - 1].id);
  };

  return (
    <div style={styles.layout}>
      <LeftSidebar
        activeId={activeId}
        onSelect={setActiveId}
      />
      <TimerStage
        mode="controller"
        socket={socket}
        rundownItems={items}
        activeId={activeId}
        onNext={handleNext}
        onPrev={handlePrev}
      />
      <RightSidebar socket={socket} />
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    width: "100%",
    background: "#0a0a0b",
    overflow: "hidden",
  },
};