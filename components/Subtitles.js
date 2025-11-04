import { useMemo } from 'react';

export function Subtitles({ segments, currentTime }) {
  const activeSegment = useMemo(() => {
    return segments.find((segment) => currentTime >= segment.start && currentTime < segment.end);
  }, [currentTime, segments]);

  return (
    <div className={`subtitle-track ${activeSegment ? 'subtitle-track--visible' : ''}`} aria-live="polite">
      {activeSegment ? <p>{activeSegment.english}</p> : null}
    </div>
  );
}
