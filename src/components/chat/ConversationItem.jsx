import { useNavigate, useParams } from "react-router-dom";
import { conversationUrl } from "@/config/routes";
import {
  useGetConversationQuery,
  useGetConversationUserQuery,
  useGetLatestMessageQuery,
} from "@/store/api/conversationsApi";
import LatestMessage from "./LatestMessage";
import { useGetUserQuery } from "@/store/api/usersApi";
import timeAgo from "@/utils/timeAgo";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/authSlice";

const ConversationItem = ({ conversationUser }) => {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const { conversation_id: conversationId, user_id: userId } = conversationUser;
  const { data: conversation } = useGetConversationQuery(conversationId);
  const { data: user } = useGetUserQuery(userId);
  const currentUser = useSelector(selectCurrentUser);
  const { data: latestMessage = {} } = useGetLatestMessageQuery(
    conversationId,
    {
      skip: !conversationId,
    },
  );
  const { data: conversationUsers } =
    useGetConversationUserQuery(conversationId);
  const _conversationUser = conversationUsers?.find(
    (_conversationUser) => _conversationUser?.user_id != currentUser?.id,
  );
  const opponentConversationUserId = _conversationUser?.user_id;
  const { data: opponentConversationUser } = useGetUserQuery(
    opponentConversationUserId,
  );

  const isActive = activeId === conversationId.toString();
  const handleConversationClick = () => {
    navigate(conversationUrl(conversationId), {
      state: {
        selectedUserId: userId,
      },
    });
  };

  let displayName;
  if (conversation?.type === "dm") {
    displayName =
      opponentConversationUser?.name || opponentConversationUser?.email;
  } else {
    displayName = conversation?.name;
  }
  const avatar = user?.avatar || null;
  const initials = displayName?.slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-300 mx-2 mb-1 border-transparent border
        ${
          isActive
            ? "bg-indigo-50/70 border-indigo-100 shadow-sm ring-1 ring-indigo-100"
            : "hover:bg-slate-50 border-transparent hover:border-slate-100"
        }
      `}
      onClick={handleConversationClick}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className={`w-11 h-11 rounded-full object-cover border-2 transition-colors ${isActive ? "border-indigo-200" : "border-white"}`}
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full ${isActive ? "bg-indigo-600 shadow-md ring-2 ring-indigo-200" : "bg-indigo-400"} flex items-center justify-center text-white text-sm font-semibold transition-all`}
          >
            {initials}
          </div>
        )}
        {/* Online dot */}
        <span
          className={`absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full ${isActive ? "ring-2 ring-emerald-100" : ""}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span
            className={`truncate text-[14px] transition-colors ${isActive ? "font-bold text-indigo-950" : "font-semibold text-slate-700"}`}
          >
            {displayName}
          </span>
          {/* Timestamp nếu có */}
          {latestMessage?.created_at && (
            <span
              className={`text-[11px] flex-shrink-0 ml-2 transition-colors ${isActive ? "text-indigo-500 font-medium" : "text-slate-400"}`}
            >
              {timeAgo(latestMessage.created_at)}
            </span>
          )}
        </div>
        <div
          className={`transition-colors ${isActive ? "opacity-100" : "opacity-80"}`}
        >
          <LatestMessage conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
