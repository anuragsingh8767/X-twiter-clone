import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import User from "../models/user.model.js";
import { createChatMessage } from "../controllers/chat.controller.js";

const getJwtFromCookie = (cookieHeader = "") =>
	cookieHeader
		.split("; ")
		.find((cookie) => cookie.startsWith("jwt="))
		?.slice(4);

export const initializeSocket = (httpServer, allowedOrigins) => {
	const io = new Server(httpServer, {
		cors: {
			origin: allowedOrigins,
			credentials: true,
		},
	});

	io.use(async (socket, next) => {
		try {
			const token = getJwtFromCookie(socket.handshake.headers.cookie);
			if (!token) return next(new Error("Unauthorized"));

			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const user = await User.findById(decoded.userId).select("-password");
			if (!user) return next(new Error("Unauthorized"));

			socket.user = user;
			next();
		} catch {
			next(new Error("Unauthorized"));
		}
	});

	io.on("connection", (socket) => {
		const userRoom = `user:${socket.user._id}`;
		socket.join(userRoom);

		socket.on("send_message", async ({ recipientId, text }, acknowledge) => {
			try {
				const cleanText = text?.trim();
				if (!recipientId || !cleanText || cleanText.length > 2000) {
					return acknowledge?.({ error: "Invalid message" });
				}

				const message = await createChatMessage(socket.user._id, recipientId, cleanText);
				io.to(`user:${recipientId}`).emit("new_message", message);
				io.to(userRoom).emit("new_message", message);
				acknowledge?.({ message });
			} catch (error) {
				acknowledge?.({ error: error.message === "Recipient not found" ? error.message : "Unable to send message" });
			}
		});
	});

	return io;
};