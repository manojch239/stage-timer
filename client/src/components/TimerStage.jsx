import { useState, useEffect, useCallback, useRef } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "mm:ss" → total seconds. Returns 0 on bad input. */
const parseMMSS = (str = "") => {
  const parts = str.split(":").map(Number);
  if (parts.length === 2 && !parts.some(isNaN)) return parts[0] * 60 + parts[1];
  if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
  return 0;
};

/** Format seconds → "mm:ss" (prepends "-" when negative). */
const fmtMMSS = (s) => {
  const abs = Math.abs(s);
  const m = Math.floor(abs / 60);
  const sec = abs % 60;
  return `${s < 0 ? "-" : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

/** Determine colour phase from remaining seconds and total. */
const getPhase = (remaining, total) => {
  if (remaining < 0) return "overtime";
  if (remaining <= 60) return "danger";
  if (remaining <= total * 0.15) return "warning";
  return "normal";
};

const PHASE_COLORS = {
  normal:   "#f0f0f0",
  warning:  "#fbbf24",
  danger:   "#f87171",
  overtime: "#f87171",
};

const PHASE_BAR = {
  normal:   "#e8ff6b",
  warning:  "#fbbf24",
  danger:   "#f87171",
  overtime: "#f87171",
};

// ─── Transport icons ──────────────────────────────────────────────────────────

const IconPlay  = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M5 3L13 8L5 13V3Z" fill="currentColor"/></svg>;
const IconPause = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M4 3H6.5V13H4V3ZM9.5 3H12V13H9.5V3Z" fill="currentColor"/></svg>;
const IconReset = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5C4.9 2.3 6.7 1.5 8.5 1.5C12.4 1.5 15.5 4.6 15.5 8.5C15.5 12.4 12.4 15.5 8.5 15.5C4.6 15.5 1.5 12.4 1.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M1.5 2.5V5.5H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconPrev  = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 3.5V12.5M13 4L7 8L13 12V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconNext  = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M13 3.5V12.5M3 4L9 8L3 12V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconStop  = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="3.5" y="3.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>;

// ─── TimerStage ───────────────────────────────────────────────────────────────

/**
 * TimerStage — countdown display + transport controls + message bar.
 *
 * Props
 * ─────────────────────────────────────────────────────────────────────────────
 * mode           "controller" | "viewer"   default "controller"
 *                  controller → shows transport controls + message bar
 *                  viewer     → big read-only display (used in Viewer.jsx)
 *
 * socket         socket.io socket instance (optional)
 *                  When provided the component both emits AND listens so it
 *                  works as the authoritative source in Controller and as a
 *                  passive listener in Viewer.
 *
 * rundownItems   array of { id, title, speaker, duration }
 * activeId       id of the currently selected item
 * onNext         () => void   — called when user presses Next ▶|
 * onPrev         () => void   — called when user presses |◀ Prev
 *
 * All props are optional; the component works fully standalone without a socket.
 */
export default function TimerStage({
  mode = "controller",
  socket,
  rundownItems = [],
  activeId,
  onNext,
  onPrev,
}) {
  const isController = mode === "controller";

  // ── Derive active item ───────────────────────────────────────────────────────
  const activeItem = rundownItems.find((it) => it.id === activeId) ?? null;
  const nextItem   = (() => {
    const idx = rundownItems.findIndex((it) => it.id === activeId);
    return idx >= 0 && idx < rundownItems.length - 1 ? rundownItems[idx + 1] : null;
  })();

  // ── Timer state ──────────────────────────────────────────────────────────────
  const totalRef    = useRef(activeItem ? parseMMSS(activeItem.duration) : 300);
  const [total,     setTotal]     = useState(totalRef.current);
  const [remaining, setRemaining] = useState(totalRef.current);
  const [playing,   setPlaying]   = useState(false);
  const [message,   setMessage]   = useState("");

  // Viewer-mode: store active item received from server
  const [viewerItem, setViewerItem] = useState(null);

  const intervalRef = useRef(null);

  // ── Reset + sync when active item changes (controller only) ──────────────────
  useEffect(() => {
    if (!isController) return;
    const secs = activeItem ? parseMMSS(activeItem.duration) : 300;
    totalRef.current = secs;
    setTotal(secs);
    setRemaining(secs);
    setPlaying(false);
    clearInterval(intervalRef.current);
    // Tell server (and all viewers) about the new active item immediately
    if (socket) {
      socket.emit("syncState", {
        remainingSeconds: secs,
        totalSeconds:     secs,
        activeItem:       activeItem ?? { id: null, title: "Standby", speaker: "", duration: "00:00" },
      });
    }
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tick ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          const next = r - 1;
          if (socket && isController) {
            socket.emit("timerUpdate", { remainingSeconds: next, totalSeconds: totalRef.current });
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, socket, isController]);

  // ── Socket listener (Viewer mode) ────────────────────────────────────────────
  useEffect(() => {
    if (!socket || isController) return;
    const handler = ({ remainingSeconds, totalSeconds, activeItem: ai }) => {
      if (totalSeconds  !== undefined) { totalRef.current = totalSeconds; setTotal(totalSeconds); }
      if (remainingSeconds !== undefined) setRemaining(remainingSeconds);
      if (ai            !== undefined) setViewerItem(ai);
    };
    socket.on("timerUpdate", handler);
    return () => socket.off("timerUpdate", handler);
  }, [socket, isController]);

  // ── Transport handlers ───────────────────────────────────────────────────────
  const handlePlayPause = useCallback(() => {
    setPlaying((p) => {
      const next = !p;
      if (socket && isController) socket.emit(next ? "startTimer" : "pauseTimer");
      return next;
    });
  }, [socket, isController]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    clearInterval(intervalRef.current);
    setRemaining(totalRef.current);
    if (socket && isController) socket.emit("resetTimer");
  }, [socket, isController]);

  const handleAdjust = useCallback((delta) => {
    setRemaining((r) => {
      const next = Math.max(-3600, r + delta); // allow up to -60 min overtime
      if (socket && isController) {
        socket.emit("timerUpdate", { remainingSeconds: next, totalSeconds: totalRef.current });
      }
      return next;
    });
  }, [socket, isController]);

  const handleStop = useCallback(() => {
    setPlaying(false);
    clearInterval(intervalRef.current);
    setRemaining(0);
    if (socket && isController) socket.emit("resetTimer");
  }, [socket, isController]);

  const handleSendMessage = useCallback(() => {
    const msg = message.trim();
    if (!msg) return;
    if (socket) socket.emit("stageMessage", { text: msg, at: new Date().toISOString() });
    setMessage("");
  }, [message, socket]);

  // ── Derived display values ───────────────────────────────────────────────────
  const phase     = getPhase(remaining, total);
  const pct       = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  const timerColor = PHASE_COLORS[phase];
  const barColor   = PHASE_BAR[phase];
  const isOvertime = remaining < 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEWER mode — mirrors controller centre stage, no transport controls
  // ─────────────────────────────────────────────────────────────────────────────
  // In viewer mode, use item info pushed from server
  const displayItem = isController ? activeItem : viewerItem;

  if (!isController) {
    return (
      <div style={v.wrap}>

        {/* Session info */}
        <div style={v.sessionLabel}>
          <span style={v.sessionLine} />
          Now running
          <span style={v.sessionLine} />
        </div>
        <div style={v.title}>{displayItem?.title ?? "Standby"}</div>
        {displayItem?.speaker && <div style={v.speaker}>{displayItem.speaker}</div>}

        {/* Timer digits */}
        <div style={{
          ...v.timerDisplay,
          color: timerColor,
          animation: phase === "danger" || phase === "overtime"
            ? "vFlicker 1s ease-in-out infinite" : "none",
        }}>
          {fmtMMSS(remaining)}
        </div>

        {/* Overtime badge */}
        {isOvertime && <div style={v.overtimeBadge}>OVERTIME</div>}

        {/* Progress bar */}
        <div style={v.progressWrap}>
          <div style={{ ...v.progressBar, width: `${pct}%`, background: barColor }} />
        </div>

        <style>{`@keyframes vFlicker{0%,100%{opacity:1}50%{opacity:0.82}}`}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTROLLER mode
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={c.wrap}>

      {/* Session info */}
      <div style={c.stage}>
        <div style={c.sessionLabel}>
          <span style={c.sessionLine} />
          Now running
          <span style={c.sessionLine} />
        </div>
        <div style={c.title}>{activeItem?.title ?? "No session selected"}</div>
        {activeItem?.speaker && <div style={c.speaker}>{activeItem.speaker}</div>}

        {/* Timer digits */}
        <div style={{
          ...c.timerDisplay,
          color: timerColor,
          animation: phase === "danger" || phase === "overtime" ? "cFlicker 1s ease-in-out infinite" : "none",
        }}>
          {fmtMMSS(remaining)}
        </div>

        {/* Overtime badge */}
        {isOvertime && (
          <div style={c.overtimeBadge}>OVERTIME</div>
        )}

        {/* Progress bar */}
        <div style={c.progressWrap}>
          <div style={{ ...c.progressBar, width: `${pct}%`, background: barColor }} />
        </div>

        {/* Transport */}
        <div style={c.transport}>
          {/* Adjust buttons */}
          <div style={c.adjGroup}>
            <button style={c.adjBtn} onClick={() => handleAdjust(-60)}>−1m</button>
            <button style={c.adjBtn} onClick={() => handleAdjust(-30)}>−30s</button>
          </div>

          <div style={c.tSep} />

          <button style={c.tBtnSm} title="Previous" onClick={onPrev}><IconPrev /></button>

          <button style={c.tBtnMd} title="Reset" onClick={handleReset}><IconReset /></button>

          {/* Play / Pause — accent coloured */}
          <button
            style={{ ...c.tBtnLg, ...(playing ? c.tBtnLgPlaying : {}) }}
            onClick={handlePlayPause}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </button>

          <button style={c.tBtnSm} title="Stop" onClick={handleStop}><IconStop /></button>

          <button style={c.tBtnSm} title="Next" onClick={onNext}><IconNext /></button>

          <div style={c.tSep} />

          <div style={c.adjGroup}>
            <button style={c.adjBtn} onClick={() => handleAdjust(30)}>+30s</button>
            <button style={c.adjBtn} onClick={() => handleAdjust(60)}>+1m</button>
          </div>
        </div>
      </div>

      {/* Next strip */}
      <div style={c.nextStrip}>
        <span style={c.nextLabel}>Next</span>
        <span style={c.nextTitle}>
          {nextItem ? `${nextItem.title}${nextItem.speaker ? " · " + nextItem.speaker : ""}` : "End of rundown"}
        </span>
        {nextItem && <span style={c.nextDur}>{nextItem.duration}</span>}
      </div>

      {/* Message bar */}
      <div style={c.msgBar}>
        <span style={c.msgLabel}>Message</span>
        <input
          style={c.msgInput}
          type="text"
          placeholder="Send a message to the stage…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <div style={c.msgQuick}>
          {["Wrap up", "2 min left", "Time's up!"].map((t) => (
            <button key={t} style={c.quickBtn} onClick={() => { setMessage(t); }}>
              {t}
            </button>
          ))}
        </div>
        <button style={c.sendBtn} onClick={handleSendMessage}>Send</button>
      </div>

      <style>{`
        @keyframes cFlicker { 0%,100%{opacity:1} 50%{opacity:0.82} }
      `}</style>
    </div>
  );
}

// ─── Controller styles ────────────────────────────────────────────────────────

const c = {
  wrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#0a0a0b",
    overflow: "hidden",
  },
  stage: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 32px 0",
    gap: 6,
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.10em",
    color: "rgba(240,240,240,0.38)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sessionLine: {
    display: "block",
    height: 1,
    width: 24,
    background: "rgba(255,255,255,0.12)",
  },
  title: {
    fontSize: 19,
    fontWeight: 600,
    color: "#f0f0f0",
    letterSpacing: "-0.02em",
    marginTop: 3,
  },
  speaker: {
    fontSize: 13,
    color: "rgba(240,240,240,0.6)",
  },
  timerDisplay: {
    fontFamily: "'Geist Mono', 'DM Mono', monospace",
    fontSize: "clamp(64px, 9vw, 96px)",
    fontWeight: 300,
    letterSpacing: "-0.04em",
    lineHeight: 1,
    margin: "18px 0 6px",
    transition: "color 0.4s",
  },
  overtimeBadge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#f87171",
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.25)",
    padding: "3px 10px",
    borderRadius: 20,
  },
  progressWrap: {
    width: "100%",
    maxWidth: 440,
    height: 3,
    background: "#1f1f25",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
    transition: "width 1s linear, background 0.4s",
  },

  // Transport
  transport: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  adjGroup: { display: "flex", gap: 3 },
  adjBtn: {
    padding: "5px 9px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#111113",
    color: "rgba(240,240,240,0.6)",
    fontFamily: "monospace",
    fontSize: 11,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tSep: { width: 1, height: 30, background: "rgba(255,255,255,0.07)", margin: "0 2px" },
  tBtnSm: {
    width: 36, height: 36,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#111113",
    color: "#f0f0f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tBtnMd: {
    width: 44, height: 44,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#111113",
    color: "#f0f0f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tBtnLg: {
    width: 56, height: 56,
    borderRadius: 14,
    border: "1px solid #e8ff6b",
    background: "#e8ff6b",
    color: "#0a0a0b",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tBtnLgPlaying: {
    background: "#111113",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#f0f0f0",
  },

  // Next strip
  nextStrip: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    margin: "0 32px 16px",
    background: "#111113",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    flexShrink: 0,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(240,240,240,0.38)",
    flexShrink: 0,
  },
  nextTitle: {
    fontSize: 13,
    color: "rgba(240,240,240,0.6)",
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  nextDur: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "rgba(240,240,240,0.38)",
    background: "#1f1f25",
    padding: "2px 7px",
    borderRadius: 5,
  },

  // Message bar
  msgBar: {
    borderTop: "1px solid rgba(255,255,255,0.07)",
    padding: "11px 20px",
    background: "#111113",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  msgLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(240,240,240,0.38)",
    flexShrink: 0,
  },
  msgInput: {
    flex: 1,
    padding: "7px 11px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#18181c",
    color: "#f0f0f0",
    fontFamily: "inherit",
    fontSize: 13,
    outline: "none",
  },
  msgQuick: { display: "flex", gap: 4 },
  quickBtn: {
    padding: "5px 9px",
    borderRadius: 7,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "rgba(240,240,240,0.6)",
    fontFamily: "inherit",
    fontSize: 11,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  },
  sendBtn: {
    padding: "7px 13px",
    borderRadius: 8,
    border: "none",
    background: "#e8ff6b",
    color: "#0a0a0b",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
};

// ─── Viewer styles — mirrors controller centre stage ──────────────────────────

const v = {
  wrap: {
    width: "100vw",
    height: "100vh",
    background: "#0a0a0b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    userSelect: "none",
    gap: 6,
    padding: "24px 32px",
    boxSizing: "border-box",
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.10em",
    color: "rgba(240,240,240,0.38)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sessionLine: {
    display: "block",
    height: 1,
    width: 24,
    background: "rgba(255,255,255,0.12)",
  },
  title: {
    fontSize: "clamp(20px, 3vw, 36px)",
    fontWeight: 600,
    color: "#f0f0f0",
    letterSpacing: "-0.02em",
    marginTop: 3,
    textAlign: "center",
  },
  speaker: {
    fontSize: "clamp(13px, 1.6vw, 20px)",
    color: "rgba(240,240,240,0.6)",
    textAlign: "center",
  },
  timerDisplay: {
    fontFamily: "'Geist Mono', 'DM Mono', monospace",
    fontSize: "clamp(80px, 16vw, 180px)",
    fontWeight: 300,
    letterSpacing: "-0.04em",
    lineHeight: 1,
    margin: "18px 0 6px",
    transition: "color 0.4s",
  },
  overtimeBadge: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#f87171",
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.25)",
    padding: "4px 14px",
    borderRadius: 20,
  },
  progressWrap: {
    width: "100%",
    maxWidth: 600,
    height: 4,
    background: "#1f1f25",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
    transition: "width 1s linear, background 0.4s",
  },
};