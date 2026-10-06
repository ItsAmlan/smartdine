// A short two-tone chime synthesized with the Web Audio API — no static
// asset to go missing or 404. A lazily-created, page-lifetime AudioContext
// is reused across calls; browsers start it suspended until a user
// gesture, which logging in already provides, so resume() is a no-op in
// the common case and a real fix the one time it isn't.
let audioCtx = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

function tone(ctx, frequency, startTime, duration) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playNotificationChime() {
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    tone(ctx, 880, now, 0.18);
    tone(ctx, 1320, now + 0.16, 0.22);
  } catch {
    // Audio is a nice-to-have alert, never worth crashing the dashboard over.
  }
}
