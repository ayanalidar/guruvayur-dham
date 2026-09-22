"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useRealtime · stubbed — was previously connecting to socket.io at
 * /?XTransformPort=3003 (Caddy gateway → Node WS service on port 3003).
 *
 * On Vercel there is no WS server, so socket.io was reconnecting forever,
 * spamming the browser console with "WebSocket connection failed".
 *
 * This stub:
 *   - Returns `connected: false` (no events ever arrive)
 *   - Provides `emit()` as a no-op
 *   - Does NOT attempt any socket connection
 *
 * Re-enable in the future by:
 *   1. Standing up a Socket.io server (Render/Railway/VPS)
 *   2. Setting NEXT_PUBLIC_WS_URL env var on Vercel
 *   3. Replacing the body of this stub with the real io() call
 *      pointing at NEXT_PUBLIC_WS_URL instead of /?XTransformPort=3003.
 */
export function useRealtime(events: string[] = []) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ event: string; data: any } | null>(null);

  // No connection attempt — silently no-op.
  useEffect(() => {
    setConnected(false);
  }, []);

  const emit = (_event: string, _data: any) => {
    // No-op — WS server not deployed.
  };

  return { connected, lastEvent, emit };
}

/**
 * useViewerCount · stubbed for same reason.
 * Returns 0 viewer count (the UI gracefully hides this if count is 0).
 */
export function useViewerCount(roomSlug: string) {
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomSlug) return;
    setCount(0);
    setConnected(false);
  }, [roomSlug]);

  return { count, connected };
}
