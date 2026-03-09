import { useLocation } from "react-router-dom";
import Sidebar from "@/components/chat/Sidebar";

function Home() {
  const { pathname } = useLocation();

  const selectedUserId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  return (
    <div className="flex h-[calc(100vh-56px)] font-sans bg-slate-50 overflow-hidden">
      <Sidebar selectedUserId={selectedUserId} />

      {/* Main content - Placeholder for empty state */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 bg-white shadow-[-4px_0_24px_-16px_rgba(0,0,0,0.1)] z-0">
        <div className="w-16 h-16 bg-slate-100 rounded-[20px] flex items-center justify-center -mt-10 shadow-sm">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-400"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[16px] text-slate-700 font-semibold mb-1">
            Chọn một người dùng để bắt đầu
          </p>
          <p className="text-[14px] text-slate-500">
            Tin nhắn của bạn sẽ hiển thị tại đây
          </p>
        </div>
      </main>
    </div>
  );
}

export default Home;
