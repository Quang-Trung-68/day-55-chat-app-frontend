import ConversationList from "./ConversationList";
import SearchDropdown from "./SearchDropdown";

function Sidebar() {
  return (
    <aside className="w-72 min-w-[280px] bg-white border-r border-slate-200 flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <span className="font-semibold text-[15px] text-slate-800 tracking-tight">
            Messages
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
