import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import socketClient from "@/socketClient";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/authSlice";
import {
  useGetMessagesQuery,
  useCreateMessageMutation,
  useGetConversationUserQuery,
  useGetConversationQuery,
  useGetConversationsQuery,
} from "@/store/api/conversationsApi";
import { useGetUserQuery } from "@/store/api/usersApi";
import { getApiErrorMessage } from "@/utils/errors";

import Sidebar from "@/components/chat/Sidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

function Conversation() {
  const { id: conversationId } = useParams();
  const [error, setError] = useState("");

  const [createMessage, { isLoading }] = useCreateMessageMutation();

  const currentUser = useSelector(selectCurrentUser);
  
  // Lấy thông tin conversation và những users trong conversation
  const { data: conversation } = useGetConversationQuery(conversationId, { skip: !conversationId });
  const { data: conversationUsers } = useGetConversationUserQuery(conversationId, { skip: !conversationId });
  
  const _conversationUser = conversationUsers?.find(
    (cu) => cu?.user_id != currentUser?.id,
  );
  const opponentConversationUserId = _conversationUser?.user_id;

  const { data: opponentConversationUser } = useGetUserQuery(
    opponentConversationUserId,
    { skip: !opponentConversationUserId }
  );

  const { state } = useLocation();
  const { selectedUserId } = state || {};

  let displayName, finalEmail, finalName;
  if (conversation?.type === "dm") {
    displayName = opponentConversationUser?.name || opponentConversationUser?.email;
    finalEmail = opponentConversationUser?.email;
    finalName = opponentConversationUser?.name;
  } else {
    displayName = conversation?.name;
    finalName = conversation?.name;
  }

  // Get conversations out of cache to detect "isTyping"
  const { data: conversations = [] } = useGetConversationsQuery();
  const isTyping = conversations.find(
    (c) => String(c.conversation_id) === String(conversationId)
  )?.isTyping;

  const initials = displayName?.slice(0, 2).toUpperCase() ?? "?";
  const COLORS = [
    "bg-blue-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-red-500",
  ];
  const limit = 10;
  const avatarColor = COLORS[(opponentConversationUserId ?? 0) % COLORS.length];

  // ── Socket: tin nhắn realtime ──────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    const channelName = `conversation-${conversationId}`;
    const channel = socketClient.subscribe(channelName);

    const handleNewMessage = (message) => {
      setAllMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    channel.bind("created", handleNewMessage);

    return () => {
      channel.unbind("created", handleNewMessage);
      // Không gọi unsubscribe/unbind_all ở đây vì Sidebar/ConversationList 
      // có thể cũng đang subscribe vào channel này để cập nhật list bên ngoài.
    };
  }, [conversationId]);

  const handleSend = async (text) => {
    setError("");
    try {
      await createMessage({
        conversationId,
        type: "text",
        content: text,
      }).unwrap();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Không thể gửi tin nhắn. Vui lòng thử lại."),
      );
    }
  };

  // ══════════════════════════════════════════════════════════════
  // ██  INFINITY LOADING MESSAGES —— VIẾT LẠI TRIỆT ĐỂ  ██
  // ══════════════════════════════════════════════════════════════

  const [nextCursor, setNextCursor] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── SYNC RESET khi conversationId đổi ──────────────────────
  // React official pattern: "adjusting state during rendering"
  // (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  //
  // Sử dụng pattern này thay vì useEffect([conversationId]) vì:
  //  - useEffect chạy SAU render → 1 render cycle sử dụng state cũ
  //  - Gây useGetMessagesQuery gọi với cursor CŨ + id MỚI → sai data
  //  - Sync reset TRONG render body → state đúng ngay lập tức
  const [prevConversationId, setPrevConversationId] = useState(conversationId);
  if (prevConversationId !== conversationId) {
    setPrevConversationId(conversationId);
    setNextCursor(null);
    setAllMessages([]);
    setHasMore(false);
    setIsInitialized(false);
  }

  // ── RTK Query ─────────────────────────────────────────────
  // refetchOnMountOrArgChange: true → LUÔN fetch mới khi args thay đổi
  // hoặc khi quay lại conversation cũ (không dùng cache cũ)
  const { data: messagesResult, isFetching } = useGetMessagesQuery(
    {
      id: conversationId,
      params: { before: nextCursor ?? undefined, limit: limit ?? undefined },
    },
    {
      skip: !conversationId,
      refetchOnMountOrArgChange: true,
    },
  );

  // ── Xử lý kết quả: phân biệt initial load vs load more ──
  useEffect(() => {
    if (!messagesResult?.messages) return;

    const { messages: newMsgs, pagination } = messagesResult;

    if (!isInitialized || nextCursor === null) {
      // Trang đầu tiên (tin mới nhất)
      setAllMessages(newMsgs);
      setIsInitialized(true);
    } else {
      // Trang cũ hơn → prepend, lọc trùng
      setAllMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const unique = newMsgs.filter((m) => !existingIds.has(m.id));
        return [...unique, ...prev];
      });
    }

    setHasMore(pagination?.hasMore ?? false);
  }, [messagesResult]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ─────────────────────────────────────────
  // isLoadingMore chỉ true khi fetch trang cũ hơn (không phải lần đầu)
  const isLoadingMore = isFetching && isInitialized;

  // ── handleLoadMore với ref guard ──────────────────────────
  // Dùng ref để tránh stale closure (isFetching có thể bị capture cũ)
  const isFetchingRef = useRef(false);
  isFetchingRef.current = isFetching; // Update mỗi render — luôn mới nhất

  const handleLoadMore = useCallback(() => {
    if (isFetchingRef.current) return;
    if (!messagesResult?.pagination?.hasMore) return;
    if (!messagesResult?.pagination?.nextCursor) return;
    setNextCursor(messagesResult.pagination.nextCursor);
  }, [messagesResult]);

  // ──────────────────────── RENDER ──────────────────────────
  return (
    <div className="flex h-[calc(100vh-56px)] font-sans bg-slate-100 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col bg-white overflow-hidden relative shadow-[-4px_0_24px_-16px_rgba(0,0,0,0.1)] z-0">
        <ChatHeader
          initials={initials}
          avatarColor={avatarColor}
          name={finalName}
          email={finalEmail}
        />

        {error && (
          <div className="absolute top-[76px] left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200 text-sm shadow-sm z-20 flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <MessageList
          key={conversationId}
          messages={allMessages}
          hasNextPage={hasMore}
          loadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />

        <div className="relative w-full">
          {isTyping && (
            <div className="absolute bottom-2 left-6 bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 z-10 text-[13px] font-medium text-slate-600 animate-in fade-in slide-in-from-bottom-2 origin-bottom-right">
              {finalName} đang nhập
              <div className="flex items-center gap-0.5 ml-0.5 mt-[2px]">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
        </div>

        <MessageInput onSend={handleSend} isLoading={isLoading} conversationId={conversationId} />
      </main>
    </div>
  );
}

export default Conversation;
