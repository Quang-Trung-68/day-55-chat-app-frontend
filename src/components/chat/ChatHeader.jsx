import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";

function ChatHeader({ initials, avatarColor, userName }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 h-[68px] flex items-center gap-4 flex-shrink-0 z-10 shadow-sm relative">
      <Link
        to={ROUTES.HOME}
        className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0 shadow-sm hover:shadow active:scale-95"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>
      <div
        className={`w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center text-base font-semibold text-white flex-shrink-0 shadow-sm ${avatarColor}`}
      >
        {initials}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="text-[15px] font-semibold text-slate-900 truncate">
          {userName ?? "User"}
        </div>
        <div className="text-[12.5px] font-medium text-emerald-600 mt-0.5 flex items-center gap-1.5">
          <div className="w-[6px] h-[6px] rounded-full bg-emerald-500 animate-pulse" />
          Đang hoạt động
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
