import { useEffect, useRef } from "react";

/**
 * A custom hook that runs a callback on an interval, but only when:
 * 1. The document is visible (tab is active).
 * 2. An optional condition is met (enabled).
 *
 * @param {Function} callback - The function to call.
 * @param {number} delay - The delay in milliseconds. If null/undefined/0, polling is disabled.
 * @param {boolean} enabled - Whether polling is active/enabled.
 * @param {boolean} runOnMount - If true, callback is invoked immediately when the hook mounts and is enabled.
 */
export function useVisibilityPoll(callback, delay, enabled = true, runOnMount = true) {
  const savedCallback = useRef(callback);

  // Keep callback reference updated
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !delay) {
      return;
    }

    // Invoke immediately if visible and runOnMount is true
    if (runOnMount && document.visibilityState === "visible") {
      savedCallback.current();
    }

    const tick = () => {
      if (document.visibilityState === "visible") {
        savedCallback.current();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        savedCallback.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    const id = setInterval(tick, delay);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [delay, enabled, runOnMount]);
}
