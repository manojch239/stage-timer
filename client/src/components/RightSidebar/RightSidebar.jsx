import { useState } from 'react';
import { ClockMsgPanel } from './ClockMsgPanel';
import { SchedulePanel } from './SchedulePanel';
import { ConnectionsPanel } from './ConnectionsPanel';

export function RightSidebar({ state, connections }) {
  const [activeTab, setActiveTab] = useState('clock');

  return (
    <div className="w-73 border-l border-border bg-surface flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center border-b border-border px-4">
        <button
          onClick={() => setActiveTab('clock')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            activeTab === 'clock'
              ? 'border-b-2 border-accent text-text'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Clock & Msgs
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            activeTab === 'schedule'
              ? 'border-b-2 border-accent text-text'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            activeTab === 'connections'
              ? 'border-b-2 border-accent text-text'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Connections
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'clock' && (
          <ClockMsgPanel messages={state.messages} />
        )}
        {activeTab === 'schedule' && (
          <SchedulePanel state={state} />
        )}
        {activeTab === 'connections' && (
          <ConnectionsPanel connections={connections} />
        )}
      </div>
    </div>
  );
}
