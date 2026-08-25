import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		chat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Chat",
			required: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
			required: true,
			trim: true,
			maxlength: 2000,
		},
		read: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;