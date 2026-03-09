import { useLocation, useNavigate } from "react-router-dom";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { conversationUrl } from "@/config/routes";
import { useCreateConversationMutation } from "@/store/api/conversationsApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/authSlice";
import LatestMessage from "./LatestMessage";
import ConversationList from "./ConversationList";

const COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
];

function Sidebar({ selectedUserId }) {
  const { state } = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const { data: users = [], isLoading } = useGetUsersQuery();

  const [createConversation] = useCreateConversationMutation();

  const handleConversation = async (userId) => {
    const result = await createConversation({
      name: "abcd",
      type: "dm",
      user_ids: [parseInt(userId)],
    });
    const conversationId = result.data.id;
    navigate(conversationUrl(conversationId), {
      state: {
        selectedUserId: userId,
      },
    });
  };

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

        {/* Search bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Tìm kiếm..."
            className="w-full py-2 pl-9 pr-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ConversationList />
    </aside>
  );
}

export default Sidebar;
