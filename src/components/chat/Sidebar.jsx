import ConversationList from "./ConversationList";
import SearchDropdown from "./SearchDropdown";

function Sidebar() {
  return (
    <aside className="w-72 min-w-[280px] bg-white border-r border-slate-200 flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-slate-100/60 bg-slate-50/30 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4 pl-1">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <span className="font-bold text-[17px] bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
            Tin nhắn
          </span>
        </div>

        {/* Search bar with dropdown */}
        <SearchDropdown />
      </div>

      {/* Conversation list */}
      <ConversationList />
    </aside>
  );
}

export default Sidebar;
