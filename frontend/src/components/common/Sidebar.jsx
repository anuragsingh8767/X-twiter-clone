import XSvg from "../svgs/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {
	const queryClient = useQueryClient();
	const { mutate: logout } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/auth/logout", {
					method: "POST",
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: () => {
			toast.error("Logout failed");
		},
	});
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	return (
		<div className='fixed bottom-0 inset-x-0 z-50 w-full bg-black md:static md:flex-[2_2_0] md:w-20 md:max-w-52'>
			<div className='flex h-16 w-full items-center justify-around border-t border-gray-700 md:sticky md:top-0 md:left-0 md:h-screen md:flex-col md:items-stretch md:justify-start md:border-t-0 md:border-r md:w-full'>
				<Link to='/' aria-label='Home' className='hidden justify-center md:flex md:justify-start'>
					<XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>
				<ul className='flex w-full items-center justify-around gap-0 md:mt-4 md:flex-col md:items-stretch md:gap-3'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/messages'
							aria-label='Messages'
							className='flex max-w-fit cursor-pointer items-center gap-3 rounded-full p-2 transition-all duration-300 hover:bg-stone-900 md:py-2 md:pl-2 md:pr-4'
						>
							<IoChatbubbleEllipses className='w-6 h-6' />
							<span className='hidden text-lg md:block'>Messages</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							aria-label='Home'
							className='flex max-w-fit cursor-pointer items-center gap-3 rounded-full p-2 transition-all duration-300 hover:bg-stone-900 md:py-2 md:pl-2 md:pr-4'
						>
							<MdHomeFilled className='w-8 h-8' />
							<span className='hidden text-lg md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							aria-label='Notifications'
							className='flex max-w-fit cursor-pointer items-center gap-3 rounded-full p-2 transition-all duration-300 hover:bg-stone-900 md:py-2 md:pl-2 md:pr-4'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='hidden text-lg md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${authUser?.username}`}
							aria-label='Profile'
							className='flex max-w-fit cursor-pointer items-center gap-3 rounded-full p-2 transition-all duration-300 hover:bg-stone-900 md:py-2 md:pl-2 md:pr-4'
						>
							<FaUser className='w-6 h-6' />
							<span className='hidden text-lg md:block'>Profile</span>
						</Link>
					</li>
					<li className='flex justify-center md:hidden'>
						<button
							type='button'
							aria-label='Log out'
							className='rounded-full p-2 hover:bg-stone-900'
							onClick={() => logout()}
						>
							<BiLogOut className='h-6 w-6' />
						</button>
					</li>
				</ul>
				{authUser && (
					<Link
						to={`/profile/${authUser.username}`}
						className='mt-auto mb-10 hidden items-start gap-2 rounded-full px-4 py-2 transition-all duration-300 hover:bg-[#181818] md:flex'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={authUser?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
								<p className='text-white font-bold text-sm w-20 truncate'>{authUser?.fullName}</p>
								<p className='text-slate-500 text-sm'>@{authUser?.username}</p>
							</div>
							<BiLogOut
								className='w-5 h-5 cursor-pointer'
								onClick={(e) => {
									e.preventDefault();
									logout();
								}}
							/>
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;
