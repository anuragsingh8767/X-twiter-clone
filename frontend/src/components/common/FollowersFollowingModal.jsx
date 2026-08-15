import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft } from "react-icons/fa6";
import useFollow from "../../hooks/useFollow";

const FollowersFollowingModal = ({ username, modalId, listType }) => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const { follow, isPending } = useFollow();

	const endpoint = listType === "followers" ? `/api/users/followers/${username}` : `/api/users/following/${username}`;

	const {
		data: usersList = [],
		isLoading,
	} = useQuery({
		queryKey: [listType, username],
		queryFn: async () => {
			try {
				const res = await fetch(endpoint);
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	return (
		<dialog id={modalId} className='modal'>
			<div className='modal-box border rounded-md border-gray-700 shadow-md w-full max-w-md'>
				{/* Header */}
				<div className='flex items-center gap-3 py-4 px-4 border-b border-gray-700 sticky top-0 bg-black bg-opacity-80 z-10'>
					<button
						className='hover:bg-gray-900 rounded-full p-2 transition'
						onClick={() => document.getElementById(modalId).close()}
					>
						<FaArrowLeft className='w-5 h-5' />
					</button>
					<h3 className='font-bold text-lg capitalize'>{listType}</h3>
				</div>

				{/* Content */}
				<div className='py-4'>
					{isLoading ? (
						<div className='flex justify-center py-8'>
							<span className='loading loading-spinner loading-md'></span>
						</div>
					) : usersList.length === 0 ? (
						<p className='text-center text-gray-500 py-8'>No {listType} yet</p>
					) : (
						<div className='space-y-0'>
							{usersList.map((user) => {
								const isFollowing = authUser?.following.includes(user._id);
								const isMyProfile = authUser?._id === user._id;

								return (
									<div
										key={user._id}
										className='flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-900 transition cursor-pointer border-b border-gray-700'
									>
										{/* User Info */}
										<div className='flex items-center gap-3 flex-1 min-w-0'>
											<div className='avatar'>
												<div className='w-10 rounded-full flex-shrink-0'>
													<img
														src={user.profileImg || "/avatar-placeholder.png"}
														alt={user.username}
													/>
												</div>
											</div>
											<div className='flex-1 min-w-0'>
												<p className='font-bold text-sm truncate'>{user.fullName}</p>
												<p className='text-xs text-gray-500 truncate'>@{user.username}</p>
											</div>
										</div>

										{/* Follow/Unfollow Button */}
										{!isMyProfile && (
											<button
												className={`btn btn-sm rounded-full font-bold min-w-fit ${
													isFollowing
														? "btn-outline text-white"
														: "btn-primary text-white"
												}`}
												onClick={() => follow(user._id)}
												disabled={isPending}
											>
												{isPending ? (
													<span className='loading loading-spinner loading-xs'></span>
												) : isFollowing ? (
													"Following"
												) : (
													"Follow"
												)}
											</button>
										)}
										{isMyProfile && (
											<span className='text-xs text-gray-500 font-semibold'>You</span>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Close modal when clicking outside */}
			<form method='dialog' className='modal-backdrop'>
				<button>close</button>
			</form>
		</dialog>
	);
};

export default FollowersFollowingModal;
