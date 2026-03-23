import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Socket.IO Logic
  const users = new Map<string, { userId: string; socketId: string; displayName: string }>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (data: { userId: string; displayName: string }) => {
      users.set(socket.id, { ...data, socketId: socket.id });
      io.emit("user_status", Array.from(users.values()));
      console.log(`${data.displayName} joined`);
    });

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on("send_message", (data: { roomId: string; text: string; senderId: string; senderName: string }) => {
      // Broadcast to room
      io.to(data.roomId).emit("new_message", {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
    });

    socket.on("typing", (data: { roomId: string; userId: string; displayName: string; isTyping: boolean }) => {
      socket.to(data.roomId).emit("user_typing", data);
    });

    socket.on("disconnect", () => {
      const user = users.get(socket.id);
      if (user) {
        users.delete(socket.id);
        io.emit("user_status", Array.from(users.values()));
        console.log(`${user.displayName} disconnected`);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
