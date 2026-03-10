import { useNavigate, useParams } from "react-router-dom";
import { conversationUrl } from "@/config/routes";
import {
  useGetConversationQuery,
  useGetConversationUserQuery,
  useGetLatestMessageQuery,
  conversationsApi,
} from "@/store/api/conversationsApi";
import LatestMessage from "./LatestMessage";
import { useGetUserQuery } from "@/store/api/usersApi";
import timeAgo from "@/utils/timeAgo";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "@/store/authSlice";
import { useEffect, useState } from "react";

const ConversationItem = ({ conversationUser }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: activeId } = useParams();
  const { conversation_id: conversationId, user_id: userId, unread, isTyping } = conversationUser;
  
  const { data: conversation } = useGetConversationQuery(conversationId);
  const { data: user } = useGetUserQuery(userId);
  const currentUser = useSelector(selectCurrentUser);

  const isActive = activeId === conversationId?.toString();

  // ----- Auto remove 'unread' badge if the conversation is active -----
  useEffect(() => {
    if (isActive && unread) {
      dispatch(
        conversationsApi.util.updateQueryData(
          "getConversations",
          undefined,
          (draft) => {
            const idx = draft.findIndex(c => c.conversation_id === conversationId);
            if (idx !== -1) draft[idx].unread = false;
          }
        )
      );
    }
  }, [isActive, unread, conversationId, dispatch]);
  // ------------------------------------------------------------------

  // Dữ liệu này sẽ tự động thay đổi nếu Socket ở ConversationList gọi updateQueryData
  const { data: displayMessage } = useGetLatestMessageQuery(conversationId, {
    skip: !conversationId,
  });

  const { data: conversationUsers } = useGetConversationUserQuery(conversationId);
  const _conversationUser = conversationUsers?.find(
    (_conversationUser) => _conversationUser?.user_id != currentUser?.id,
  );
  const opponentConversationUserId = _conversationUser?.user_id;
  const { data: opponentConversationUser } = useGetUserQuery(
    opponentConversationUserId,
    { skip: !opponentConversationUserId }
  );

  const handleConversationClick = () => {
    navigate(conversationUrl(conversationId), {
      state: {
        selectedUserId: userId,
      },
    });
  };

  // ----- Auto update time cho timestamp mỗi 1 phút -----
  // Component sẽ re-render và hàm timeAgo() được tính toán lại dựa trên thời gian hiện tại
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 60000); // 1 phút
    return () => clearInterval(timer);
  }, []);
  // -----------------------------------------------------

  let displayName;
  if (conversation?.type === "dm") {
    displayName =
      opponentConversationUser?.name || opponentConversationUser?.email;
  } else {
    displayName = conversation?.name;
  }
  const avatar = user?.avatar || null;
  const initials = displayName?.slice(0, 2).toUpperCase() || "?";

  // Hiển thị unread nếu true VÀ không phải cuộc hội thoại đang mở
  const showUnread = unread && !isActive;

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
        
        {/* Online dot - luôn giữ lại để dự phòng như yêu cầu */}
        <span
          className={`absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full ${isActive ? "ring-2 ring-emerald-100" : ""}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-0.5">
          <span
            className={`truncate text-[14px] transition-colors ${showUnread ? "font-bold text-slate-900" : isActive ? "font-bold text-indigo-950" : "font-semibold text-slate-700"}`}
          >
            {displayName}
          </span>
          {/* Timestamp được tính toán lại tự động do setTick chạy liên tục */}
          {displayMessage?.created_at && (
            <span
              className={`text-[11px] flex-shrink-0 ml-2 transition-colors ${showUnread ? "text-blue-600 font-bold" : isActive ? "text-indigo-500 font-medium" : "text-slate-400"}`}
            >
              {timeAgo(displayMessage.created_at)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center w-full">
          <div
            className={`flex-1 min-w-0 transition-colors ${isActive ? "opacity-100" : "opacity-80"}`}
          >
            {isTyping ? (
              <div className="flex items-center gap-1.5 text-blue-500 text-[12px] font-medium h-5 mt-[2px]">
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                </div>
                Đang nhập...
              </div>
            ) : (
              <LatestMessage message={displayMessage} isUnread={showUnread} />
            )}
          </div>
          {/* Đặt nút báo chưa đọc ở lề phải, ngay dưới vị trí của timestamp */}
          {showUnread && (
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 ml-2 shadow-sm" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
