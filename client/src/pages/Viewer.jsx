// import { useEffect, useState } from "react";
// import { socket } from "../socket";

// export default function Viewer() {
//   const [seconds, setSeconds] = useState(550); // 9 minutes and 10 seconds (550s)
//   const [totalTime, setTotalTime] = useState(600); // Default 10 minutes (600s)

//   useEffect(() => {
//     socket.on("timerUpdate", (data) => {
//       setSeconds(data.remainingSeconds);
//       if (data.totalSeconds) {
//         setTotalTime(data.totalSeconds);
//       }
//     });
//     return () => {
//       socket.off("timerUpdate");
//     };
//   }, []);

//   const formatTime = () => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${String(secs).padStart(2, "0")}`;
//   };

//   const elapsedPercent = ((totalTime - seconds) / totalTime) * 100;

//   // Timer color logic
//   let timerColor = "#fff";
//   if (seconds <= 15) {
//     timerColor = "#e53e3e";
//   } else if (seconds <= 60) {
//     timerColor = "#f5a623";
//   }

//   return (
//     <div
//       className="h-screen w-screen bg-[#181716] text-white overflow-hidden flex flex-col justify-between select-none"
//       style={{ fontFamily: 'Inter, Arial, Helvetica, sans-serif' }}
//     >
//       {/* Top Center Label */}
//       <div className="w-full flex justify-center items-center pt-[2vw] pb-[1vw]">
//         <span
//           className="text-[#6ec1f6] text-[2vw] md:text-[1.2vw] font-semibold tracking-tight"
//           style={{ letterSpacing: 0 }}
//         >
//           Timer 1
//         </span>
//       </div>

//       {/* Main Timer Display */}
//       <main className="flex-1 flex items-center justify-center">
//         <h1
//           className="font-extrabold leading-none tabular-nums"
//           style={{
//             fontSize: '19vw',
//             lineHeight: 1,
//             fontFamily: 'Inter, Arial, Helvetica, sans-serif',
//             fontWeight: 800,
//             letterSpacing: 0,
//             textAlign: 'center',
//             userSelect: 'none',
//             color: timerColor,
//           }}
//         >
//           {formatTime()}
//         </h1>
//       </main>

//       {/* Progress Bar Section */}
//       <div
//         className="relative w-full"
//         style={{
//           height: '10vw',
//           minHeight: 60,
//           maxHeight: 140,
//           background: '#181716',
//         }}
//       >
//         {/* Full colored background track */}
//         <div className="absolute inset-0 flex w-full h-full">
//           {/* Green zone (90% of total) */}
//           <div style={{ width: '90%', background: '#5ebb72', height: '100%' }} />
//           {/* Orange zone (5% of total) */}
//           <div style={{ width: '5%', background: '#f5a623', height: '100%' }} />
//           {/* Red zone (5% of total) */}
//           <div style={{ width: '5%', background: '#e53e3e', height: '100%' }} />
//         </div>

//         {/* Consumed / Elapsed dark overlay */}
//         <div
//           className="absolute left-0 top-0 h-full"
//           style={{
//             width: `${elapsedPercent}%`,
//             background: '#232420',
//             transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
//             zIndex: 2,
//           }}
//         />

//         {/* Pointer (White triangle pointing down) */}
//         <div
//           className="absolute top-0 z-10"
//           style={{
//             left: `calc(${elapsedPercent} * (100vw - 24px) / 100)`, // 24px = triangle width, keeps pointer inside bar
//             transition: 'left 0.3s cubic-bezier(.4,0,.2,1)',
//           }}
//         >
//           <div style={{ position: 'relative', top: '-12px', width: 0, height: 0 }}>
//             <svg
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               className="overflow-visible"
//             >
//               <polygon
//                 points="12,24 0,0 24,0"
//                 fill="white"
//                 stroke="#232420"
//                 strokeWidth="2.5"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { socket } from "../socket";
import TimerStage from "../components/TimerStage";

/**
 * Viewer — full-screen stage display.
 * Passively receives timer state from the server via socket.io.
 * TimerStage handles all socket listeners when mode="viewer".
 */
export default function Viewer() {
  return (
    <TimerStage
      mode="viewer"
      socket={socket}
    />
  );
}
