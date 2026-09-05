/**
 * Guruvayur Dham Real-time Service
 * Port: 3003
 *
 * WebSocket events broadcast:
 * - booking:new — when a new booking is created (from any source)
 * - booking:cancelled — when a booking is cancelled
 * - sync:new — when a channel sync log is created
 * - kitchen:order:new — when a new kitchen order is placed
 * - kitchen:order:update — when a kitchen order status changes
 * - housekeeping:update — when a room status changes
 * - pooja:update — when a pooja booking status changes
 * - viewer:count — periodic broadcast of how many people are viewing each room
 * - stats:update — periodic broadcast of dashboard stats
 *
 * Frontend connects via: io("/?XTransformPort=3003")
 */
import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server } from "socket.io";

// ====== State ======
const roomViewers = new Map<string, Set<string>>();
const socketRoom = new Map<string, string>();

// ====== HTTP handler (runs before Socket.io for non-socket requests) ======
function httpRequestHandler(req: IncomingMessage, res: ServerResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      service: "guruvayur-realtime",
      port: 3003,
      connections: io.sockets.sockets.size,
      roomsTracked: roomViewers.size,
      timestamp: new Date().toISOString(),
    }));
    return true;
  }

  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { event, data } = JSON.parse(body);
        io.emit(event, data);
        console.log(`[broadcast] ${event} → all clients (${io.sockets.sockets.size})`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, event, clients: io.sockets.sockets.size }));
      } catch (e: any) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return true;
  }

  if (req.method === "POST" && req.url === "/broadcast-room") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { room, event, data } = JSON.parse(body);
        const viewers = roomViewers.get(room);
        if (viewers) {
          for (const sid of viewers) {
            io.to(sid).emit(event, data);
          }
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, room, event, viewers: viewers?.size || 0 }));
      } catch (e: any) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return true;
  }

  // Let Socket.io handle everything else
  return false;
}

const httpServer = createServer();

const io = new Server(httpServer, {
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ====== Attach HTTP handlers AFTER Socket.io (so they take priority for non-socket requests) ======
// We use prependListener to ensure our handler runs before Socket.io's
const originalListeners = httpServer.listeners("request").slice();
httpServer.removeAllListeners("request");
httpServer.on("request", (req, res) => {
  // Try our HTTP handlers first
  if (httpRequestHandler(req, res)) return;
  // Otherwise, call the original Socket.io listeners
  for (const listener of originalListeners) {
    listener.call(httpServer, req, res);
  }
});

// ====== Socket.io ======
io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);

  socket.on("view:room", (roomSlug: string) => {
    const prev = socketRoom.get(socket.id);
    if (prev) {
      const viewers = roomViewers.get(prev);
      if (viewers) {
        viewers.delete(socket.id);
        if (viewers.size === 0) roomViewers.delete(prev);
        else io.to(prev).emit("viewer:count", { roomSlug: prev, count: viewers.size });
      }
    }
    if (!roomViewers.has(roomSlug)) roomViewers.set(roomSlug, new Set());
    roomViewers.get(roomSlug)!.add(socket.id);
    socketRoom.set(socket.id, roomSlug);
    const count = roomViewers.get(roomSlug)!.size;
    for (const sid of roomViewers.get(roomSlug)!) {
      io.to(sid).emit("viewer:count", { roomSlug, count });
    }
    console.log(`[view:room] ${socket.id} → ${roomSlug} (${count} viewing)`);
  });

  socket.on("view:leave", () => {
    const prev = socketRoom.get(socket.id);
    if (prev) {
      const viewers = roomViewers.get(prev);
      if (viewers) {
        viewers.delete(socket.id);
        if (viewers.size === 0) roomViewers.delete(prev);
        else {
          for (const sid of viewers) {
            io.to(sid).emit("viewer:count", { roomSlug: prev, count: viewers.size });
          }
        }
      }
      socketRoom.delete(socket.id);
    }
  });

  socket.on("disconnect", () => {
    const prev = socketRoom.get(socket.id);
    if (prev) {
      const viewers = roomViewers.get(prev);
      if (viewers) {
        viewers.delete(socket.id);
        if (viewers.size === 0) roomViewers.delete(prev);
        else {
          for (const sid of viewers) {
            io.to(sid).emit("viewer:count", { roomSlug: prev, count: viewers.size });
          }
        }
      }
      socketRoom.delete(socket.id);
    }
    console.log(`[disconnect] ${socket.id}`);
  });
});

// ====== Start ======
const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`✓ Guruvayur Dham Real-time Service running on port ${PORT}`);
  console.log(`  WebSocket: io("/?XTransformPort=${PORT}")`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Broadcast: POST http://localhost:${PORT}/broadcast`);
});
