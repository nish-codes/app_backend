import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Store users: { userId: socketId }
const users = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Registers user link
    socket.on("register", (userId) => {
        users[userId] = socket.id;
        console.log(`${userId} registered with socket ${socket.id}`);
    });

    // DM 
    socket.on("private_message", ({ from, to, message }) => {
        const targetSocket = users[to];
        if (targetSocket) {
            io.to(targetSocket).emit("private_message", {
                from,
                message,
            });
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (const [userId, id] of Object.entries(users)) {
            if (id === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});