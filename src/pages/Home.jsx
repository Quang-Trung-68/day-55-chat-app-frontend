import Sidebar from "@/components/chat/Sidebar";

function Home() {
  return (
    <div className="flex h-[calc(100vh-56px)] font-sans bg-slate-50 overflow-hidden">
      <Sidebar />

      {/* Main content - Placeholder for empty state */}
      <main className="flex-1 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-white to-slate-50/50 shadow-[-4px_0_24px_-16px_rgba(0,0,0,0.1)] z-0">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full flex items-center justify-center -mt-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#blue-gradient)"
            strokeWidth="1.5"
            className="text-blue-500"
          >
            <defs>
              <linearGradient id="blue-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-[18px] text-slate-800 font-bold mb-2 tracking-tight">
            Chào mừng bạn đến với Demo Chat
          </h2>
          <p className="text-[14.5px] text-slate-500 max-w-[280px]">
            Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu nhắn tin.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Home;
