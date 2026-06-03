// Socket event names
export const EVENTS = {
  // Server -> Client
  STATE_SYNC: 'state:sync',
  CONNECTIONS_UPDATE: 'connections:update',

  // Client -> Server
  TIMER_TOGGLE: 'timer:toggle',
  TIMER_RESET: 'timer:reset',
  TIMER_ADJUST: 'timer:adjust',
  TIMER_NEXT: 'timer:next',
  TIMER_PREV: 'timer:prev',
  RUNDOWN_UPDATE: 'rundown:update',
  RUNDOWN_ADD: 'rundown:add',
  MESSAGE_SEND: 'message:send',
  MESSAGE_CLEAR: 'message:clear',
  BUFFER_UPDATE: 'buffer:update',
  ACCENT_SET: 'accent:set',
};

// Default state structure
export const DEFAULT_STATE = {
  rundown: [],
  activeIndex: 0,
  isPlaying: false,
  remaining: 0,
  messages: [],
  bufferSettings: {
    enabled: true,
    durationSec: 300,
    action: 'pause',
  },
  accentColor: '#e8ff6b',
};

// Timer status constants
export const TIMER_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  DONE: 'done',
};
