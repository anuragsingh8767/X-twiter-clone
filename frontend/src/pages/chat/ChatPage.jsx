import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa6";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { socket } from "../../utils/socket";

const fetchJson = async (endpoint) => {
	const response = await fetch(endpoint);
	const data = await response.json();
	if (!response.ok) throw new Error(data.error || "Something went wrong");
	return data;
};

const ChatPage = () => {
	const { username } = useParams();
	const queryClient = useQueryClient();
	const [draft, setDraft] = useState("");
	const [showConversationList, setShowConversationList] = useState(!username);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const { data: chats = [], isLoading: chatsLoading } = useQuery({
		queryKey: ["chats"],
		queryFn: () => fetchJson("/api/chats"),
	});
	const { data: profile } = useQuery({
		queryKey: ["chatUser", username],
		queryFn: () => fetchJson(`/api/users/profile/${username}`),
		enabled: Boolean(username),
	});

	const selectedChat = chats.find((chat) =>
		chat.participants.some((participant) => participant._id !== authUser?._id && participant.username === username)
	);
	const activeUser = profile || selectedChat?.participants.find((participant) => participant._id !== authUser?._id);

	useEffect(() => {
		setShowConversationList(!username);
	}, [username]);

	const { data: messageData, isLoading: messagesLoading } = useQuery({
		queryKey: ["messages", activeUser?._id],
		queryFn: () => fetchJson(`/api/chats/${activeUser._id}/messages`),
		enabled: Boolean(activeUser?._id),
	});

	useEffect(() => {
		if (!authUser) return;
		socket.connect();

		const handleNewMessage = (message) => {
			queryClient.setQueryData(["messages", message.sender._id === authUser._id ? message.recipient : message.sender._id], (current) => {
				if (!current || current.messages.some((item) => item._id === message._id)) return current;
				return { ...current, messages: [...current.messages, message] };
			});
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		};

		socket.on("new_message", handleNewMessage);
		return () => {
			socket.off("new_message", handleNewMessage);
			socket.disconnect();
		};
	}, [authUser, queryClient]);

	const handleSubmit = (event) => {
		event.preventDefault();
		const text = draft.trim();
		if (!text || !activeUser) return;

		socket.emit("send_message", { recipientId: activeUser._id, text }, ({ error } = {}) => {
			if (error) toast.error(error);
		});
		setDraft("");
	};

	return (
		<div className='flex-[4_4_0] border-r border-gray-700 min-h-screen flex'>
			<aside className={`${showConversationList || !activeUser ? "block" : "hidden"} sm:block w-full sm:w-64 border-r border-gray-700`}>
				<div className='p-4 border-b border-gray-700 flex items-center gap-4'>
					<Link to='/'><FaArrowLeft /></Link>
					<h1 className='font-bold text-lg'>Messages</h1>
				</div>
				{chatsLoading && <div className='p-4'><LoadingSpinner /></div>}
				{!chatsLoading && chats.map((chat) => {
					const otherUser = chat.participants.find((participant) => participant._id !== authUser?._id);
					return otherUser ? (
						<Link key={chat._id} to={`/messages/${otherUser.username}`} onClick={() => setShowConversationList(false)} className={`flex gap-2 p-3 border-b border-gray-800 hover:bg-secondary ${otherUser.username === username ? "bg-secondary" : ""}`}>
							<div className='avatar'><div className='w-10 rounded-full'><img src={otherUser.profileImg || "/avatar-placeholder.png"} alt='' /></div></div>
							<div className='min-w-0'><p className='font-bold truncate'>{otherUser.fullName}</p><p className='text-sm text-slate-500 truncate'>{chat.lastMessage?.text || "Start a conversation"}</p></div>
						</Link>
					) : null;
				})}
			</aside>

			<main className={`${activeUser && showConversationList ? "hidden sm:flex" : !activeUser ? "hidden sm:flex" : "flex"} flex-1 flex-col min-w-0`}>
				{activeUser ? (
					<>
						<header className='p-4 border-b border-gray-700 flex items-center gap-3'>
							<button type='button' aria-label='Back to conversations' className='sm:hidden' onClick={() => setShowConversationList(true)}><FaArrowLeft /></button>
							<div className='avatar'><div className='w-9 rounded-full'><img src={activeUser.profileImg || "/avatar-placeholder.png"} alt='' /></div></div>
							<div><p className='font-bold'>{activeUser.fullName}</p><p className='text-sm text-slate-500'>@{activeUser.username}</p></div>
						</header>
						<div className='flex-1 overflow-y-auto p-4 space-y-3'>
							{messagesLoading && <LoadingSpinner />}
							{!messagesLoading && messageData?.messages.length === 0 && <p className='text-center text-slate-500 mt-8'>No messages yet</p>}
							{messageData?.messages.map((message) => (
								<div key={message._id} className={`flex ${message.sender._id === authUser?._id ? "justify-end" : "justify-start"}`}>
									<p className={`max-w-[75%] px-3 py-2 rounded-2xl ${message.sender._id === authUser?._id ? "bg-primary text-white" : "bg-secondary"}`}>{message.text}</p>
								</div>
							))}
						</div>
						<form onSubmit={handleSubmit} className='p-3 border-t border-gray-700 flex gap-2'>
							<input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder='Write a message...' className='input input-bordered flex-1' />
							<button type='submit' aria-label='Send message' className='btn btn-primary text-white'><FaPaperPlane /></button>
						</form>
					</>
				) : <p className='m-auto text-slate-500'>Choose a conversation or open a profile to message someone.</p>}
			</main>
		</div>
	);
};

export default ChatPage;