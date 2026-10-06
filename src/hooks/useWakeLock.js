"use client";

import { useEffect, useRef } from "react";

// Keeps the screen from sleeping while `active` is true — meant for the
// always-on kitchen/steward displays. A wake lock is released by the
// browser whenever the tab goes into the background, so it has to be
// re-acquired on every visibilitychange back to visible, not just once.
export default function useWakeLock(active) {
  const lockRef = useRef(null);

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !navigator.wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        lockRef.current = lock;
      } catch {
        // Permission denied, unsupported, or battery saver — fail silently.
      }
    };

    acquire();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !lockRef.current) acquire();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (lockRef.current) {
        lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }
    };
  }, [active]);
}
