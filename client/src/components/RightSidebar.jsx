import { useState, useEffect } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconChevron = ({ open }) => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <path d="M9 5l-4 4-4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTrash = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
    <path d="M3 3.5h8M5.5 3.5V2.5h3V3.5M6 6v4M8 6v4M3.5 3.5l.5 7.5h6l.5-7.5"
      stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────

const Toggle = ({ on, onChange }) => (
  <div
    onClick={() => onChange(!on)}
    style={{
      width: 30, height: 17, borderRadius: 9,
      background: on ? "#e8ff6b" : "#1f1f25",
      border: `1px solid ${on ? "#e8ff6b" : "rgba(255,255,255,0.12)"}`,
      position: "relative", cursor: "pointer", flexShrink: 0,
      transition: "background 0.2s, border-color 0.2s",
    }}
  >
    <div style={{
      position: "absolute", width: 11, height: 11, borderRadius: "50%",
      background: on ? "#0a0a0b" : "rgba(240,240,240,0.38)",
      top: 2, left: on ? 15 : 2,
      transition: "left 0.2s, background 0.2s",
    }} />
  </div>
);

// ─── Dur Stepper ─────────────────────────────────────────────────────────────

const DurStepper = ({ value, onStep, min = 1, max = 60 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <button style={s.stepBtn} onClick={() => onStep(Math.max(min, value - 1))}>−</button>
    <span style={s.stepVal}>{value} min</span>
    <button style={s.stepBtn} onClick={() => onStep(Math.min(max, value + 1))}>+</button>
  </div>
);

// ─── Wall Clock ───────────────────────────────────────────────────────────────

const WallClock = () => {
  const [now, setNow] = useState(new Date());
  const [fmt24,    setFmt24]    = useState(true);
  const [showSec,  setShowSec]  = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [timezone, setTimezone] = useState("local");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const getTime = () => {
    try {
      const opts = {
        hour: "2-digit", minute: "2-digit",
        ...(showSec ? { second: "2-digit" } : {}),
        hour12: !fmt24,
        ...(timezone !== "local" ? { timeZone: timezone } : {}),
      };
      return new Intl.DateTimeFormat("en-GB", opts).format(now);
    } catch { return "--:--"; }
  };

  const getDate = () => {
    try {
      const opts = { weekday: "long", day: "numeric", month: "short", year: "numeric",
        ...(timezone !== "local" ? { timeZone: timezone } : {}) };
      return new Intl.DateTimeFormat("en-GB", opts).format(now);
    } catch { return ""; }
  };

  const CoptBtn = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ ...s.copt, ...(active ? s.coptActive : {}) }}>{label}</button>
  );

  return (
    <div style={s.clockOuter}>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>Wall Clock</span>
      </div>
      <div style={s.clockDisplay}>
        <div style={s.clockTime}>{getTime()}</div>
        {showDate && <div style={s.clockDate}>{getDate()}</div>}
      </div>
      <div style={s.clockCustomise}>
        <div style={s.custTitle}>Customise display</div>
        <div style={s.coptRow}>
          <CoptBtn label="24h" active={fmt24}  onClick={() => setFmt24(true)} />
          <CoptBtn label="12h" active={!fmt24} onClick={() => setFmt24(false)} />
        </div>
        <div style={s.coptRow}>
          <CoptBtn label="Seconds" active={showSec}  onClick={() => setShowSec(v  => !v)} />
          <CoptBtn label="Date"    active={showDate} onClick={() => setShowDate(v => !v)} />
        </div>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          style={s.tzSelect}
        >
          <option value="local">Local time</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">New York (ET)</option>
          <option value="America/Los_Angeles">Los Angeles (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Berlin">Berlin (CET)</option>
          <option value="Asia/Kolkata">Mumbai (IST)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
          <option value="Australia/Sydney">Sydney (AEST)</option>
        </select>
      </div>
    </div>
  );
};

// ─── Message Log ──────────────────────────────────────────────────────────────

const MessageLog = ({ socket }) => {
  const [entries, setEntries] = useState([
    { id: 1, text: "Session started",  time: "14:10:02", badge: "System",  sent: false },
    { id: 2, text: "Wrap up",          time: "14:28:11", badge: "Stage",   sent: false },
    { id: 3, text: "2 min left",       time: "14:30:05", badge: "Sent",    sent: true  },
    { id: 4, text: "Time's up!",       time: "14:32:00", badge: "Sent",    sent: true  },
  ]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ text, at }) => {
      const d = at ? new Date(at) : new Date();
      const time = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
      setEntries(prev => [...prev, { id: Date.now(), text, time, badge: "Sent", sent: true }]);
    };
    socket.on("stageMessage", handler);
    return () => socket.off("stageMessage", handler);
  }, [socket]);

  const clearAll = () => setEntries([]);
  const remove   = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  return (
    <div style={s.msgLogOuter}>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>Message Log</span>
        <button style={s.iconBtn} onClick={clearAll} title="Clear log"><IconTrash /></button>
      </div>
      <div style={s.msgLogScroll}>
        {entries.length === 0 && <p style={s.emptyNote}>No messages yet</p>}
        {entries.map((e) => (
          <div key={e.id} style={{ ...s.msgEntry, ...(e.sent ? s.msgEntrySent : {}) }}>
            <div style={s.msgEntryText}>{e.text}</div>
            <div style={s.msgEntryMeta}>
              <span style={s.msgEntryTime}>{e.time}</span>
              <span style={{ ...s.msgBadge, ...(e.sent ? s.msgBadgeSent : {}) }}>{e.badge}</span>
              <button style={s.entryDel} onClick={() => remove(e.id)} title="Remove"><IconTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Schedule Panel ───────────────────────────────────────────────────────────

const SchedulePanel = () => {
  const [bufferOn,  setBufferOn]  = useState(true);
  const [bufferMin, setBufferMin] = useState(5);
  const [autoStart, setAutoStart] = useState(true);
  const [warnBuf,   setWarnBuf]   = useState(true);
  const [chime,     setChime]     = useState(false);
  const [showOnViewer, setShowOnViewer] = useState(true);
  const [bufAction, setBufAction] = useState("Pause + wait");
  const [buffers, setBuffers]     = useState([
    { id: 1, label: "01→02", name: "Pre-show → Keynote",  dur: "5:00", on: true  },
    { id: 2, label: "02→03", name: "Keynote → Demo",      dur: "5:00", on: true  },
    { id: 3, label: "03→04", name: "Demo → Panel",        dur: "—",    on: false },
    { id: 4, label: "04→05", name: "Panel → Break",       dur: "3:00", on: true  },
  ]);

  const OptRow = ({ label, sub, value, onChange }) => (
    <div style={s.optRow}>
      <div style={{ flex: 1 }}>
        <span style={s.optLabel}>{label}</span>
        {sub && <span style={s.optSub}>{sub}</span>}
      </div>
      <Toggle on={value} onChange={onChange} />
    </div>
  );

  return (
    <div style={s.schedScroll}>

      <div style={s.schedSectionLabel}>Default buffer</div>
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <div style={s.cardTitle}>Buffer between sessions</div>
            <div style={s.cardSub}>Auto-inserted gap after each timer</div>
          </div>
          <Toggle on={bufferOn} onChange={setBufferOn} />
        </div>
        {bufferOn && (
          <>
            <div style={s.cardRow}>
              <span style={s.cardLabel}>Duration</span>
              <DurStepper value={bufferMin} onStep={setBufferMin} />
            </div>
            <div style={s.cardRow}>
              <span style={s.cardLabel}>Trigger action</span>
              <select value={bufAction} onChange={e => setBufAction(e.target.value)} style={s.selectSm}>
                <option>Pause + wait</option>
                <option>Auto count-up</option>
                <option>Show clock</option>
                <option>Blank screen</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div style={s.schedSectionLabel}>Per-transition overrides</div>
      {buffers.map(b => (
        <div key={b.id} style={s.bslItem}>
          <span style={s.bslIdx}>{b.label}</span>
          <span style={{ fontSize: 12, color: "rgba(240,240,240,0.6)", flex: 1 }}>{b.name}</span>
          {b.on
            ? <span style={s.bslDur}>{b.dur}</span>
            : <span style={s.bslOff}>Off</span>}
          <Toggle on={b.on} onChange={(v) => setBuffers(prev => prev.map(x => x.id === b.id ? { ...x, on: v } : x))} />
        </div>
      ))}

      <button style={s.addBufBtn} onClick={() => alert("Add custom buffer — wire up your logic here")}>
        + Add custom buffer
      </button>

      <div style={s.schedSectionLabel}>Automation</div>
      <div style={s.card}>
        <OptRow label="Auto-start next timer"  sub="After buffer ends, start next automatically" value={autoStart}    onChange={setAutoStart} />
        <OptRow label="Warn before buffer ends" sub="Flash alert 30s before buffer expires"      value={warnBuf}      onChange={setWarnBuf} />
        <OptRow label="Chime on session start"  sub="Play a soft chime when next session begins" value={chime}        onChange={setChime} />
        <OptRow label="Show buffer on viewer"   sub="Display buffer countdown on stage screens"  value={showOnViewer} onChange={setShowOnViewer} />
      </div>

    </div>
  );
};

// ─── Connections Panel ────────────────────────────────────────────────────────

const ConnectionsPanel = () => {
  const CONNS = [
    { id: 1, name: "Stage monitor",    type: "Viewer",     color: "#4ade80" },
    { id: 2, name: "Backstage tablet", type: "Viewer",     color: "#4ade80" },
    { id: 3, name: "Producer Macbook", type: "Controller", color: "#4ade80" },
    { id: 4, name: "OBS Browser",      type: "Viewer",     color: "#60a5fa" },
  ];
  const [copied, setCopied] = useState("");
  const copy = (val, key) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  };
  return (
    <div style={s.connScroll}>
      <div style={s.schedSectionLabel}>Live connections</div>
      {CONNS.map(c => (
        <div key={c.id} style={s.connItem}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.color,
            boxShadow: c.color === "#4ade80" ? `0 0 5px ${c.color}` : "none", flexShrink: 0 }} />
          <span style={s.connName}>{c.name}</span>
          <span style={s.connType}>{c.type}</span>
        </div>
      ))}
      <div style={s.schedSectionLabel}>Share links</div>
      <div style={s.card}>
        {[["Viewer link","cueflow.app/r/PLX-09/view"],["Agenda link","cueflow.app/r/PLX-09/agenda"]].map(([label, val]) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={s.linkLabel}>{label}</div>
            <div style={s.linkRow}>
              <input readOnly value={val} style={s.linkInput} onFocus={e => e.target.select()} />
              <button style={s.copyBtn} onClick={() => copy(val, label)}>
                {copied === label ? "✓" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── RightSidebar ─────────────────────────────────────────────────────────────

/**
 * RightSidebar — Wall Clock, Message Log, Schedule, Connections.
 *
 * Props
 * ──────────────────────────────────────────────────────────────────────
 * socket   socket.io socket instance (optional) — used by MessageLog
 */
export default function RightSidebar({ socket }) {
  const [collapsed, setCollapsed] = useState(false);
  const [tab,       setTab]       = useState("clock");

  // ── Collapsed ────────────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <aside style={s.sidebarCollapsed}>
        <button style={{ ...s.iconBtn, marginTop: 10 }} title="Expand" onClick={() => setCollapsed(false)}>
          {/* Chevron pointing left when collapsed on the right */}
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={s.collapsedLabel}>OPTIONS</div>
      </aside>
    );
  }

  // ── Tabs config ──────────────────────────────────────────────────────────────
  const TABS = [
    { id: "clock",       label: "Clock & Msgs" },
    { id: "schedule",    label: "Schedule"     },
    { id: "connections", label: "Connections"  },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <aside style={s.sidebar}>

      {/* Collapse button */}
      <div style={s.collapseBar}>
        <div style={s.tabsRow}>
          {TABS.map(t => (
            <button key={t.id} style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <button style={{ ...s.iconBtn, marginLeft: 6, flexShrink: 0 }} title="Collapse sidebar"
          onClick={() => setCollapsed(true)}>
          <IconChevron open={true} />
        </button>
      </div>

      {/* Tab panels */}
      {tab === "clock" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <WallClock />
          <MessageLog socket={socket} />
        </div>
      )}
      {tab === "schedule"    && <SchedulePanel />}
      {tab === "connections" && <ConnectionsPanel />}

    </aside>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  sidebar: {
    width: 292, minWidth: 292,
    borderLeft: "1px solid rgba(255,255,255,0.07)",
    background: "#111113",
    display: "flex", flexDirection: "column",
    overflow: "hidden", height: "100%",
    transition: "width 0.25s cubic-bezier(.4,0,.2,1), min-width 0.25s cubic-bezier(.4,0,.2,1)",
    flexShrink: 0,
  },
  sidebarCollapsed: {
    width: 36, minWidth: 36,
    borderLeft: "1px solid rgba(255,255,255,0.07)",
    background: "#111113",
    display: "flex", flexDirection: "column", alignItems: "center",
    overflow: "hidden", height: "100%",
    transition: "width 0.25s cubic-bezier(.4,0,.2,1), min-width 0.25s cubic-bezier(.4,0,.2,1)",
    flexShrink: 0,
  },
  collapsedLabel: {
    marginTop: 16, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
    color: "rgba(240,240,240,0.2)", writingMode: "vertical-rl",
    textOrientation: "mixed", transform: "rotate(180deg)", userSelect: "none",
  },
  collapseBar: {
    display: "flex", alignItems: "center",
    padding: "0 8px 0 0",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    flexShrink: 0,
  },
  tabsRow: { display: "flex", flex: 1 },
  tab: {
    flex: 1, padding: "10px 4px",
    fontSize: 11, fontWeight: 500,
    color: "rgba(240,240,240,0.38)",
    textAlign: "center", cursor: "pointer",
    border: "none", borderBottom: "2px solid transparent",
    background: "none", fontFamily: "inherit",
    transition: "all 0.15s",
  },
  tabActive: { color: "#f0f0f0", borderBottomColor: "#e8ff6b" },

  iconBtn: {
    width: 24, height: 24, borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "rgba(240,240,240,0.38)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
  },

  // ── Clock ──
  clockOuter: {
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    display: "flex", flexDirection: "column",
    flexShrink: 0,
  },
  sectionHeader: {
    padding: "10px 14px 9px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  sectionTitle: {
    fontSize: 10, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.09em",
    color: "rgba(240,240,240,0.38)",
  },
  clockDisplay: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 4, padding: "12px 12px 8px",
  },
  clockTime: {
    fontFamily: "'Geist Mono', 'DM Mono', monospace",
    fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 300,
    letterSpacing: "-0.03em", color: "#f0f0f0", lineHeight: 1,
  },
  clockDate: { fontSize: 11, color: "rgba(240,240,240,0.38)", letterSpacing: "0.02em" },
  clockCustomise: {
    padding: "8px 12px 10px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    background: "#18181c", display: "flex", flexDirection: "column", gap: 6,
  },
  custTitle: {
    fontSize: 10, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.08em", color: "rgba(240,240,240,0.38)", marginBottom: 2,
  },
  coptRow: { display: "flex", flexWrap: "wrap", gap: 5 },
  copt: {
    padding: "4px 9px", borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent", color: "rgba(240,240,240,0.6)",
    fontFamily: "inherit", fontSize: 11, cursor: "pointer", transition: "all 0.14s",
  },
  coptActive: {
    background: "rgba(232,255,107,0.12)",
    borderColor: "rgba(232,255,107,0.25)",
    color: "#e8ff6b",
  },
  tzSelect: {
    width: "100%", padding: "5px 8px", borderRadius: 7,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#1f1f25", color: "#f0f0f0",
    fontFamily: "inherit", fontSize: 11, outline: "none", cursor: "pointer",
  },

  // ── Message log ──
  msgLogOuter: {
    flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
  },
  msgLogScroll: {
    flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex",
    flexDirection: "column", gap: 5,
  },
  emptyNote: { textAlign: "center", color: "rgba(240,240,240,0.25)", fontSize: 12, padding: "20px 0" },
  msgEntry: {
    padding: "7px 10px", borderRadius: 8,
    background: "#18181c", border: "1px solid rgba(255,255,255,0.07)",
    display: "flex", flexDirection: "column", gap: 2,
  },
  msgEntrySent: {},
  msgEntryText: { fontSize: 12, color: "#f0f0f0" },
  msgEntryMeta: { display: "flex", alignItems: "center", gap: 6 },
  msgEntryTime: { fontFamily: "monospace", fontSize: 10, color: "rgba(240,240,240,0.38)", flex: 1 },
  msgBadge: {
    fontSize: 10, padding: "1px 5px", borderRadius: 4,
    background: "#1f1f25", color: "rgba(240,240,240,0.38)",
  },
  msgBadgeSent: {
    background: "rgba(232,255,107,0.08)",
    color: "#e8ff6b", border: "1px solid rgba(232,255,107,0.15)",
  },
  entryDel: {
    background: "none", border: "none", color: "rgba(240,240,240,0.25)",
    cursor: "pointer", padding: 2, display: "flex", alignItems: "center",
  },

  // ── Schedule ──
  schedScroll: { flex: 1, overflowY: "auto", padding: "10px 10px 16px", display: "flex", flexDirection: "column", gap: 8 },
  schedSectionLabel: {
    fontSize: 10, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.08em", color: "rgba(240,240,240,0.38)", padding: "4px 2px 2px",
  },
  card: {
    background: "#18181c", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8,
  },
  cardHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontSize: 12, fontWeight: 500, color: "#f0f0f0" },
  cardSub:   { fontSize: 11, color: "rgba(240,240,240,0.38)", marginTop: 1 },
  cardRow:   { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardLabel: { fontSize: 12, color: "rgba(240,240,240,0.6)" },
  stepBtn: {
    width: 22, height: 22, borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)", background: "#1f1f25",
    color: "#f0f0f0", fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.14s",
  },
  stepVal: { fontFamily: "monospace", fontSize: 12, color: "#f0f0f0", minWidth: 40, textAlign: "center" },
  selectSm: {
    padding: "4px 7px", borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)", background: "#1f1f25",
    color: "#f0f0f0", fontFamily: "monospace", fontSize: 11, cursor: "pointer", outline: "none",
  },
  optRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "2px 0", gap: 8 },
  optLabel: { fontSize: 12, color: "rgba(240,240,240,0.6)", display: "block" },
  optSub:   { fontSize: 11, color: "rgba(240,240,240,0.35)", display: "block", marginTop: 1 },

  bslItem: {
    display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
    borderRadius: 8, background: "#18181c", border: "1px solid rgba(255,255,255,0.07)",
  },
  bslIdx: { fontFamily: "monospace", fontSize: 10, color: "rgba(240,240,240,0.38)", minWidth: 32 },
  bslDur: {
    fontFamily: "monospace", fontSize: 11, color: "#e8ff6b",
    background: "rgba(232,255,107,0.08)", padding: "2px 6px", borderRadius: 4,
    border: "1px solid rgba(232,255,107,0.12)", flexShrink: 0,
  },
  bslOff: { fontSize: 11, color: "rgba(240,240,240,0.25)", flexShrink: 0 },
  addBufBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
    padding: 8, borderRadius: 10, border: "1px dashed rgba(255,255,255,0.12)",
    background: "transparent", color: "rgba(240,240,240,0.38)",
    fontFamily: "inherit", fontSize: 12, cursor: "pointer", transition: "all 0.15s", width: "100%",
  },

  // ── Connections ──
  connScroll: { flex: 1, overflowY: "auto", padding: "10px 10px 16px", display: "flex", flexDirection: "column", gap: 6 },
  connItem: {
    display: "flex", alignItems: "center", gap: 8, padding: "7px 9px",
    borderRadius: 8, background: "#18181c", border: "1px solid rgba(255,255,255,0.07)",
  },
  connName: { fontSize: 12, color: "rgba(240,240,240,0.6)", flex: 1 },
  connType: {
    fontSize: 10, color: "rgba(240,240,240,0.38)",
    background: "#1f1f25", padding: "1px 5px", borderRadius: 4,
  },
  linkLabel: { fontSize: 11, color: "rgba(240,240,240,0.38)", marginBottom: 4 },
  linkRow: { display: "flex", gap: 6 },
  linkInput: {
    flex: 1, padding: "5px 8px", borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)", background: "#1f1f25",
    color: "#f0f0f0", fontFamily: "monospace", fontSize: 11, outline: "none",
  },
  copyBtn: {
    padding: "5px 9px", borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)", background: "#1f1f25",
    color: "rgba(240,240,240,0.6)", fontFamily: "inherit", fontSize: 11,
    cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
  },
};