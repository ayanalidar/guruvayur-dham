"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * useRealtime — connects to the WebSocket service and listens for events.
 * Falls back to polling if the socket can't connect.
 */
export function useRealtime(events: string[] = []) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ event: string; data: any } | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect via the Caddy gateway with XTransformPort
    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    for (const event of events) {
      socket.on(event, (data: any) => {
        setLastEvent({ event, data });
      });
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  return { connected, lastEvent, emit };
}

/**
 * useViewerCount — tracks how many people are viewing a specific room.
 * Call this on room detail pages to show "X people viewing" social proof.
 */
export function useViewerCount(roomSlug: string) {
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomSlug) return;
    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 3,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("view:room", roomSlug);
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("viewer:count", (data: { roomSlug: string; count: number }) => {
      if (data.roomSlug === roomSlug) {
        setCount(data.count);
      }
    });

    return () => {
      socket.emit("view:leave");
      socket.disconnect();
    };
  }, [roomSlug]);

  return { count, connected };
}
