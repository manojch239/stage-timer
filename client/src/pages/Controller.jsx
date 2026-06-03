import { useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconMenu = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconEdit = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
    <path d="M9.5 2L12 4.5L5 11.5H2.5V9L9.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTrash = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
    <path d="M3 3.5h8M5.5 3.5V2.5h3V3.5M6 6v4M8 6v4M3.5 3.5l.5 7.5h6l.5-7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M2 12h12M8 2v8M5 6l3 4 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevron = ({ open }) => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 4.5V7L8.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ─── Status Dot ───────────────────────────────────────────────────────────────

const STATUS = { playing: "playing", done: "done", idle: "idle" };

const StatusDot = ({ status }) => {
  const styles = {
    width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 5,
    ...(status === STATUS.playing && { background: "#4ade80", boxShadow: "0 0 5px #4ade80" }),
    ...(status === STATUS.done    && { background: "rgba(240,240,240,0.25)" }),
    ...(status === STATUS.idle    && { background: "rgba(255,255,255,0.12)" }),
  };
  return <div style={styles} />;
};

// ─── Inline Edit Form ─────────────────────────────────────────────────────────

const InlineEditForm = ({ item, onSave, onCancel }) => {
  const [title,    setTitle]    = useState(item.title);
  const [speaker,  setSpeaker]  = useState(item.speaker);
  const [duration, setDuration] = useState(item.duration);

  const handleSave = (e) => {
    e.stopPropagation();
    if (!title.trim()) return;
    onSave({ ...item, title: title.trim(), speaker: speaker.trim(), duration: duration.trim() });
  };

  return (
    <div onClick={(e) => e.stopPropagation()} style={styles.editOverlay}>
      <div style={styles.editRow}>
        <input
          style={styles.editInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          autoFocus
        />
        <input
          style={{ ...styles.editInput, ...styles.editInputDur }}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="mm:ss"
        />
      </div>
      <div style={styles.editRow}>
        <input
          style={styles.editInput}
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          placeholder="Speaker (optional)"
        />
      </div>
      <div style={styles.editActions}>
        <button style={styles.cancelBtn} onClick={(e) => { e.stopPropagation(); onCancel(); }}>Cancel</button>
        <button style={styles.saveBtn} onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

// ─── Buffer Row ───────────────────────────────────────────────────────────────

const BufferRow = ({ duration }) => (
  <div style={styles.bufferRow}>
    <div style={{ opacity: 0.3, display: "flex", alignItems: "center" }}><IconClock /></div>
    <span style={styles.bufferLabel}>Buffer</span>
    <span style={styles.bufferDur}>{duration}</span>
  </div>
);

// ─── Rundown Item ─────────────────────────────────────────────────────────────

const RundownItem = ({ item, index, isActive, isEditing, onSelect, onEditOpen, onEditSave, onEditCancel, onDelete }) => {
  const isDone = item.status === STATUS.done;

  return (
    <>
      <div
        onClick={() => onSelect(item.id)}
        style={{
          ...styles.item,
          ...(isActive ? styles.itemActive : {}),
          ...(isDone   ? styles.itemDone  : {}),
        }}
      >
        <span style={{ ...styles.itemNum, ...(isActive ? { color: "var(--accent)" } : {}) }}>
          {String(index + 1).padStart(2, "0")}
        </span>

        <div style={styles.itemBody}>
          <div style={styles.itemTitleRow}>
            <span style={{ ...styles.itemTitle, ...(isDone ? styles.itemTitleDone : {}) }}>
              {item.title}
            </span>
            <button
              style={styles.editBtn}
              className="ri-edit-btn"
              title="Edit"
              onClick={(e) => { e.stopPropagation(); onEditOpen(item.id); }}
            >
              <IconEdit />
            </button>
            <button
              style={{ ...styles.editBtn, marginLeft: 1 }}
              className="ri-edit-btn"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            >
              <IconTrash />
            </button>
          </div>
          <div style={styles.itemMeta}>
            {item.speaker && <span style={styles.itemSpeaker}>{item.speaker}</span>}
            <span style={{ ...styles.itemDuration, ...(isActive ? styles.itemDurationActive : {}) }}>
              {item.duration}
            </span>
          </div>
        </div>

        <StatusDot status={item.status} />
      </div>

      {isEditing && (
        <InlineEditForm item={item} onSave={onEditSave} onCancel={onEditCancel} />
      )}
    </>
  );
};

// ─── Add Timer Modal ──────────────────────────────────────────────────────────

const AddTimerForm = ({ onAdd, onClose }) => {
  const [title,    setTitle]    = useState("");
  const [speaker,  setSpeaker]  = useState("");
  const [duration, setDuration] = useState("10:00");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), speaker: speaker.trim(), duration: duration.trim() || "10:00" });
    onClose();
  };

  return (
    <div style={styles.addFormWrap} onClick={(e) => e.stopPropagation()}>
      <div style={styles.addFormTitle}>New Timer</div>
      <input style={styles.editInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Session title" autoFocus />
      <input style={styles.editInput} value={speaker} onChange={(e) => setSpeaker(e.target.value)} placeholder="Speaker (optional)" />
      <input style={{ ...styles.editInput, fontFamily: "monospace" }} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="mm:ss" />
      <div style={styles.editActions}>
        <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button style={styles.saveBtn} onClick={handleSubmit}>Add Timer</button>
      </div>
    </div>
  );
};

// ─── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  { id: 1, title: "Pre-show & Welcome",    speaker: "Emcee",         duration: "10:00", status: STATUS.done,    showBuffer: false },
  { id: 2, title: "Opening Keynote",       speaker: "Priya Mehta",   duration: "35:00", status: STATUS.playing, showBuffer: true,  bufferDuration: "05:00" },
  { id: 3, title: "Product Demo — Core",   speaker: "Dev Team",      duration: "20:00", status: STATUS.idle,    showBuffer: false },
  { id: 4, title: "Panel: Growth & Scale", speaker: "4 panelists",   duration: "45:00", status: STATUS.idle,    showBuffer: false },
  { id: 5, title: "Break",                 speaker: "",              duration: "15:00", status: STATUS.idle,    showBuffer: false },
  { id: 6, title: "Fireside Chat",         speaker: "CEO × Reporter",duration: "30:00", status: STATUS.idle,    showBuffer: false },
  { id: 7, title: "Audience Q&A",          speaker: "All speakers",  duration: "25:00", status: STATUS.idle,    showBuffer: false },
  { id: 8, title: "Closing Remarks",       speaker: "Priya Mehta",   duration: "05:00", status: STATUS.idle,    showBuffer: false },
];

// ─── LeftSidebar ──────────────────────────────────────────────────────────────

/**
 * LeftSidebar — Rundown / Events panel
 *
 * Props:
 *  activeId      {number}            — id of the currently-running timer
 *  onSelect      {(id) => void}      — called when user clicks a rundown item
 *
 * All rundown state lives here so the component is self-contained for now.
 * When you wire up a global store (Zustand / Context) lift items state up.
 */
export default function LeftSidebar({ activeId, onSelect }) {
  const [items,      setItems]      = useState(DEFAULT_ITEMS);
  const [editingId,  setEditingId]  = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelect = (id) => {
    if (onSelect) onSelect(id);
  };

  const handleEditSave = (updated) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleAdd = ({ title, speaker, duration }) => {
    const newItem = {
      id: Date.now(),
      title,
      speaker,
      duration,
      status: STATUS.idle,
      showBuffer: false,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // ── Collapsed state ──────────────────────────────────────────────────────────

  if (collapsed) {
    return (
      <aside style={{ ...styles.sidebar, width: 40, alignItems: "center", paddingTop: 12 }}>
        <button style={styles.iconBtn} title="Expand rundown" onClick={() => setCollapsed(false)}>
          <IconChevron open={true} />
        </button>
      </aside>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <aside style={styles.sidebar}>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Rundown</span>
        <div style={styles.headerActions}>
          <button style={styles.iconBtn} title="Collapse" onClick={() => setCollapsed(true)}>
            <IconMenu />
          </button>
          <button style={styles.iconBtn} title="Add timer" onClick={() => setShowAdd((v) => !v)}>
            <IconPlus />
          </button>
        </div>
      </div>

      {/* Import CSV */}
      <button style={styles.importBtn} onClick={() => alert("CSV import — wire up your file picker here")}>
        <IconDownload />
        Import CSV rundown
      </button>

      {/* Add Timer inline form */}
      {showAdd && <AddTimerForm onAdd={handleAdd} onClose={() => setShowAdd(false)} />}

      {/* Scrollable list */}
      <div style={styles.list}>
        {items.map((item, idx) => (
          <div key={item.id}>
            <RundownItem
              item={item}
              index={idx}
              isActive={item.id === activeId}
              isEditing={editingId === item.id}
              onSelect={handleSelect}
              onEditOpen={(id) => setEditingId((prev) => (prev === id ? null : id))}
              onEditSave={handleEditSave}
              onEditCancel={() => setEditingId(null)}
              onDelete={handleDelete}
            />
            {item.showBuffer && <BufferRow duration={item.bufferDuration} />}
          </div>
        ))}
      </div>

      {/* Add timer footer button */}
      <button style={styles.addBtn} onClick={() => setShowAdd((v) => !v)}>
        <IconPlus />
        Add timer
      </button>

      {/* Scoped hover styles — avoids a CSS file dependency */}
      <style>{`
        .ri-edit-btn { opacity: 0; }
        [data-rundown-item]:hover .ri-edit-btn { opacity: 1; }
      `}</style>
    </aside>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// All colours use the same CSS variables as the rest of the app so theming
// stays consistent. Fall-back literals are provided for standalone dev.

const styles = {
  sidebar: {
    width: 268,
    minWidth: 268,
    borderRight: "1px solid rgba(255,255,255,0.07)",
    background: "#111113",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "100%",
  },

  // ── Header ──
  header: {
    padding: "12px 14px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(240,240,240,0.38)",
  },
  headerActions: { display: "flex", gap: 4 },
  iconBtn: {
    width: 24, height: 24,
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "rgba(240,240,240,0.38)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
  },

  // ── Import button ──
  importBtn: {
    margin: "8px 10px 0",
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 10px",
    borderRadius: 10,
    border: "1px dashed rgba(255,255,255,0.12)",
    background: "transparent",
    color: "rgba(240,240,240,0.6)",
    fontFamily: "inherit",
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.15s",
    width: "calc(100% - 20px)",
    flexShrink: 0,
  },

  // ── Scrollable list ──
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "6px 8px",
  },

  // ── Rundown item ──
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: "9px 10px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.12s",
    border: "1px solid transparent",
    marginBottom: 2,
    position: "relative",
  },
  itemActive: {
    background: "rgba(232,255,107,0.06)",
    borderColor: "rgba(232,255,107,0.15)",
  },
  itemDone: { opacity: 0.55 },

  itemNum: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "rgba(240,240,240,0.38)",
    minWidth: 16,
    paddingTop: 2,
  },

  itemBody: { flex: 1, minWidth: 0 },
  itemTitleRow: { display: "flex", alignItems: "center", gap: 5 },
  itemTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "#f0f0f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.3,
    flex: 1,
    minWidth: 0,
  },
  itemTitleDone: {
    textDecoration: "line-through",
    color: "rgba(240,240,240,0.38)",
  },

  editBtn: {
    opacity: 0,
    transition: "opacity 0.15s",
    background: "none",
    border: "none",
    color: "rgba(240,240,240,0.38)",
    cursor: "pointer",
    padding: 1,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },

  itemMeta: { display: "flex", alignItems: "center", gap: 5, marginTop: 3 },
  itemSpeaker: {
    fontSize: 11,
    color: "rgba(240,240,240,0.38)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 110,
  },
  itemDuration: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "rgba(240,240,240,0.38)",
    background: "#1f1f25",
    padding: "1px 5px",
    borderRadius: 4,
    flexShrink: 0,
  },
  itemDurationActive: {
    background: "rgba(232,255,107,0.10)",
    color: "#e8ff6b",
  },

  // ── Buffer ──
  bufferRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 10px",
    marginBottom: 2,
    borderRadius: 6,
    border: "1px dashed rgba(255,255,255,0.05)",
  },
  bufferLabel: {
    fontSize: 11,
    color: "rgba(240,240,240,0.38)",
    fontStyle: "italic",
    flex: 1,
  },
  bufferDur: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "rgba(240,240,240,0.38)",
    background: "#1f1f25",
    padding: "1px 5px",
    borderRadius: 4,
  },

  // ── Inline edit form ──
  editOverlay: {
    background: "#18181c",
    borderRadius: 10,
    border: "1px solid rgba(232,255,107,0.25)",
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 4,
  },
  editRow: { display: "flex", gap: 5 },
  editInput: {
    flex: 1,
    background: "#1f1f25",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 6,
    color: "#f0f0f0",
    fontFamily: "inherit",
    fontSize: 12,
    padding: "4px 8px",
    outline: "none",
  },
  editInputDur: {
    width: 64,
    flex: "0 0 64px",
    fontFamily: "monospace",
  },
  editActions: { display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 2 },
  saveBtn: {
    padding: "3px 10px",
    borderRadius: 5,
    background: "#e8ff6b",
    border: "none",
    color: "#0a0a0b",
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "3px 8px",
    borderRadius: 5,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(240,240,240,0.6)",
    fontFamily: "inherit",
    fontSize: 11,
    cursor: "pointer",
  },

  // ── Add timer form ──
  addFormWrap: {
    margin: "0 8px 6px",
    background: "#18181c",
    border: "1px solid rgba(232,255,107,0.2)",
    borderRadius: 10,
    padding: "10px 10px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flexShrink: 0,
  },
  addFormTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(240,240,240,0.6)",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },

  // ── Footer add button ──
  addBtn: {
    margin: "6px 8px 8px",
    padding: 8,
    borderRadius: 10,
    border: "1px dashed rgba(255,255,255,0.12)",
    background: "transparent",
    color: "rgba(240,240,240,0.38)",
    fontFamily: "inherit",
    fontSize: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.15s",
    flexShrink: 0,
  },
};