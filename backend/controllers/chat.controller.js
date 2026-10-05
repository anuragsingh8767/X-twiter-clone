import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const getOrCreateChat = async (firstUserId, secondUserId) => {
		let chat = await Chat.findOne({
			participants: { $all: [firstUserId, secondUserId], $size: 2 },
		});

		if (!chat) {
			chat = await Chat.create({ participants: [firstUserId, secondUserId] });
		}

		return chat;
};

const populateMessage = (message) =>
	message.populate({ path: "sender", select: "username fullName profileImg" });

export const getChats = async (req, res) => {
	try {
		const chats = await Chat.find({ participants: req.user._id })
			.sort({ updatedAt: -1 })
			.populate({ path: "participants", select: "username fullName profileImg" })
			.populate({ path: "lastMessage", populate: { path: "sender", select: "username fullName profileImg" } });

		res.status(200).json(chats);
	} catch (error) {
		console.error("Error in getChats controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const otherUser = await User.findById(req.params.userId).select("_id");
		if (!otherUser) return res.status(404).json({ error: "User not found" });

		const chat = await getOrCreateChat(req.user._id, otherUser._id);
		const messages = await Message.find({ chat: chat._id })
			.sort({ createdAt: 1 })
			.populate({ path: "sender", select: "username fullName profileImg" });

		await Message.updateMany(
			{ chat: chat._id, recipient: req.user._id, read: false },
			{ read: true }
		);

		res.status(200).json({ chatId: chat._id, messages });
	} catch (error) {
		console.error("Error in getMessages controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const createChatMessage = async (senderId, recipientId, text) => {
		const recipient = await User.findById(recipientId).select("_id");
		if (!recipient) throw new Error("Recipient not found");

		const chat = await getOrCreateChat(senderId, recipientId);
		const message = await Message.create({ chat: chat._id, sender: senderId, recipient: recipientId, text });
		chat.lastMessage = message._id;
		await chat.save();

		return populateMessage(message);
};

export const sendMessage = async (req, res) => {
	try {
		const text = req.body.text?.trim();
		if (!text) return res.status(400).json({ error: "Message text is required" });
		if (text.length > 2000) return res.status(400).json({ error: "Message is too long" });

		const message = await createChatMessage(req.user._id, req.params.userId, text);
		res.status(201).json(message);
	} catch (error) {
		if (error.message === "Recipient not found") return res.status(404).json({ error: error.message });
		console.error("Error in sendMessage controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};