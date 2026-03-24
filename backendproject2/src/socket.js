const { Server } = require("socket.io");

function initSocket(httpServer, { onClientConnected } = {}) {
  const io = new Server(httpServer, {
    path: "/ws",
    cors: { origin: "*" },
  });

  const userSockets = new Map();

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId || null;
    if (userId) {
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId).add(socket.id);
    }

    socket.emit("connected", { userId });
    onClientConnected?.({ socket, userId });

    socket.on("ping", () => socket.emit("pong", Date.now()));

    socket.on("disconnect", () => {
      if (userId && userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (!userSockets.get(userId).size) userSockets.delete(userId);
      }
    });
  });

  function broadcast(event, data) {
    io.emit(event, data);
  }

  function emitToUsers(userIds, event, data) {
    const targets = Array.isArray(userIds) ? userIds : [userIds];
    for (const uid of targets) {
      const ids = userSockets.get(uid);
      if (!ids) continue;
      for (const socketId of ids) {
        io.to(socketId).emit(event, data);
      }
    }
  }

  return { io, broadcast, emitToUsers };
}

module.exports = {
  initSocket,
};
