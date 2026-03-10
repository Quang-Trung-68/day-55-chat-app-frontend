import { selectCurrentUser } from "@/store/authSlice";
import truncate from "@/utils/truncate";
import { useSelector } from "react-redux";

/* eslint-disable react/prop-types */
export default function LatestMessage({ message, isUnread }) {
  const currentUser = useSelector(selectCurrentUser);

  if (!message || Object.keys(message).length === 0) {
    return (
      <div className="flex justify-between text-[12px] text-slate-500 truncate mt-[2px] pr-2">
        <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap italic">
          Chưa có tin nhắn
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between text-[12px] truncate mt-[2px] pr-2">
      <div className={`text-[12.5px] ${isUnread ? "text-slate-900 font-semibold" : "text-slate-500 font-medium"} whitespace-nowrap tracking-tight`}>
        {currentUser?.id == message?.user_id ? "Bạn: " : ""}
        {truncate(message?.content || "")}
      </div>
    </div>
  );
}
