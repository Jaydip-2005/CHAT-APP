import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { log } from "console";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRouter.js";
import { Server } from "socket.io";

//create Express app and HTTP server
const app = express();
const server = http.createServer(app);
    
//Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "UPDATE", "DELETE"],
  },
});

//store online users
export const userSocketMap = {}; //{userId: socketId}

//socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  //Emit online users to all connected clientes
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//Middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(cors());

//Route setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("server is listening to the port:" + PORT);
});
