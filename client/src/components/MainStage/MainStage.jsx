import { TransportControls } from './TransportControls';
import { NextStrip } from './NextStrip';
import { MessagePanel } from './MessagePanel';

export function MainStage({ state }) {
  const currentItem = state.rundown[state.activeIndex];
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerClasses = () => {
    let baseClass = 'font-mono text-text transition-colors duration-400 leading-none';
    if (state.remaining <= 15) {
      return baseClass + ' text-red animate-danger-flicker';
    } else if (state.remaining <= 60) {
      return baseClass + ' text-amber';
    }
    return baseClass;
  };

  const getProgressBarClasses = () => {
    let baseClass = 'h-0.75 rounded-xs transition-all duration-1000 ease-linear';
    if (state.remaining <= 15) {
      return baseClass + ' bg-red';
    } else if (state.remaining <= 60) {
      return baseClass + ' bg-amber';
    }
    return baseClass + ' bg-accent';
  };

  const totalDuration = currentItem?.duration || 0;
  const progressPercent = totalDuration > 0 ? ((totalDuration - state.remaining) / totalDuration) * 100 : 0;

  return (
    <div className="flex flex-col overflow-hidden bg-bg h-full">
      {/* Timer Stage */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-8 pt-6 pb-0">
        {/* Session label */}
        <div className="text-2xs font-medium uppercase tracking-widest text-text-muted flex items-center gap-1.5">
          <span className="h-0.25 w-6 bg-border-2"></span>
          Now Running
          <span className="h-0.25 w-6 bg-border-2"></span>
        </div>

        {/* Timer title */}
        <h2 className="text-[19px] font-semibold text-text tracking-tight mt-0.75">
          {currentItem?.title || 'No Item'}
        </h2>

        {/* Speaker */}
        {currentItem?.speaker && (
          <p className="text-sm text-text-muted-2">
            {currentItem.speaker}
          </p>
        )}

        {/* Timer display */}
        <div className={getTimerClasses()} style={{ fontSize: 'clamp(64px, 9vw, 96px)', fontWeight: 300, letterSpacing: '-0.04em', margin: '18px 0 6px' }}>
          {formatTime(state.remaining)}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-110 h-0.75 bg-surface-3 rounded-xs overflow-hidden mb-4">
          <div
            className={getProgressBarClasses()}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Transport controls */}
        <TransportControls
          isPlaying={state.isPlaying}
          remaining={state.remaining}
          totalDuration={totalDuration}
        />
      </div>

      {/* Next strip */}
      <NextStrip rundown={state.rundown} activeIndex={state.activeIndex} />

      {/* Message panel */}
      <MessagePanel messages={state.messages} />
    </div>
  );
}
