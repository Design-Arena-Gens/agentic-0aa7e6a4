import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXPERIENCE_DURATION, NARRATION_SEGMENTS, SCENES } from '@/data/narration';
import { useTimeline } from '@/hooks/useTimeline';
import { useVoiceover } from '@/hooks/useVoiceover';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { SceneLayer } from '@/components/SceneLayer';
import { Subtitles } from '@/components/Subtitles';
import { FilmGrain } from '@/components/FilmGrain';

export function CinematicExperience() {
  const { elapsed, progress, isRunning, start, reset } = useTimeline(EXPERIENCE_DURATION);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  const startExperience = useCallback(() => {
    setHasFinished(false);
    setHasStarted(true);
    reset();
    setTimeout(() => {
      start();
    }, 50);
  }, [reset, start]);

  useEffect(() => {
    if (elapsed >= EXPERIENCE_DURATION) {
      setHasFinished(true);
    }
  }, [elapsed]);

  const voiceoverState = useVoiceover({
    active: hasStarted && isRunning,
    segments: NARRATION_SEGMENTS
  });

  const ambientState = useAmbientSound(hasStarted && isRunning);

  const activeSceneId = useMemo(() => {
    const current = SCENES.find((scene) => elapsed >= scene.start && elapsed < scene.end);
    return current ? current.id : null;
  }, [elapsed]);

  const experienceStatus = useMemo(() => {
    if (!hasStarted) return 'ready';
    if (hasFinished) return 'finished';
    if (isRunning) return 'playing';
    return 'paused';
  }, [hasFinished, hasStarted, isRunning]);

  return (
    <main className="experience-container">
      <div className="experience-frame" role="document" aria-label="Cinematic horror experience">
        {SCENES.map((scene) => (
          <SceneLayer key={scene.id} scene={scene} elapsed={elapsed} />
        ))}
        <FilmGrain />
        <div className="experience-overlay">
          <div className="experience-progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ transform: `scaleX(${Math.max(progress, 0.01)})` }} />
          </div>
          <div className="experience-footer">
            <div className="status-chip">{experienceStatus}</div>
            <div className="status-chip">scene: {activeSceneId || '—'}</div>
            <div className={`status-chip ${voiceoverState.supported ? '' : 'status-chip--warning'}`}>
              VO: {voiceoverState.supported ? 'Hindi' : 'Unavailable'}
            </div>
            <div className={`status-chip ${ambientState.supported ? '' : 'status-chip--warning'}`}>
              Atmos: {ambientState.supported ? 'Active' : 'Unavailable'}
            </div>
            <div className="status-chip">{elapsed.toFixed(1)}s / {EXPERIENCE_DURATION}s</div>
          </div>
        </div>
        <Subtitles segments={NARRATION_SEGMENTS} currentTime={hasStarted ? elapsed : -1} />
        {!hasStarted ? (
          <div className="intro-card">
            <h1>Midnight Static</h1>
            <p>
              A 60-second analog horror sequence. Wear headphones, enable Hindi voice synthesis, and click below to begin.
            </p>
            <button type="button" className="cta-button" onClick={startExperience}>
              Begin the Descent
            </button>
          </div>
        ) : null}
        {hasFinished ? (
          <div className="outro-card">
            <p>The fog settles, but something still listens.</p>
            <button type="button" className="cta-button" onClick={startExperience}>
              Replay the Phenomenon
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
