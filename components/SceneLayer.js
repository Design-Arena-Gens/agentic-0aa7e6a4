import { useMemo } from 'react';

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function SceneLayer({ scene, elapsed }) {
  const { start, end } = scene;
  const isWithin = elapsed >= start && elapsed < end;

  const opacity = useMemo(() => {
    const fadeIn = clamp((elapsed - start) / 2);
    const fadeOut = clamp((end - elapsed) / 2);
    return clamp(Math.min(fadeIn, fadeOut, 1));
  }, [elapsed, end, start]);

  const jumpCutClass = elapsed >= 42.5 && elapsed < 43.5 && scene.id === 'scene3' ? 'scene-layer--jump' : '';

  return (
    <div
      className={`scene-layer ${scene.visualClass} ${isWithin ? 'scene-layer--active' : ''} ${jumpCutClass}`}
      style={{ opacity: isWithin ? Math.max(opacity, 0.05) : 0 }}
      aria-hidden={!isWithin}
    >
      <div className="scene-overlay">
        <div className="scene-title">{scene.title}</div>
        <div className="scene-logline">{scene.logline}</div>
      </div>
    </div>
  );
}
