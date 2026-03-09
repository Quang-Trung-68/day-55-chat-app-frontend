import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import socketClient from "@/socketClient";
import {
  useGetMessagesQuery,
  useCreateMessageMutation,
} from "@/store/api/conversationsApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { getApiErrorMessage } from "@/utils/errors";

import Sidebar from "@/components/chat/Sidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

function Conversation() {
  const { id: conversationId } = useParams();
  const [error, setError] = useState("");

  const { data: users = [] } = useGetUsersQuery();
  const [createMessage, { isLoading }] = useCreateMessageMutation();

  const selectedUser = users.find(
    (u) => String(u.id) === String(conversationId),
  );
  const { state } = useLocation();
  const { selectedUserId } = state || {};

  const initials = selectedUser?.email?.[0]?.toUpperCase() ?? "?";
  const COLORS = [
    "bg-blue-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-red-500",
  ];
  const avatarColor = COLORS[(selectedUser?.id ?? 0) % COLORS.length];

  // ── Socket: tin nhắn realtime ──────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    const channelName = `conversation-${conversationId}`;
    const channel = socketClient.subscribe(channelName);

    channel.bind("created", (message) => {
      setAllMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      channel.unbind_all();
      socketClient.unsubscribe(channelName);
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
      params: { before: nextCursor ?? undefined },
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
      <Sidebar selectedUserId={selectedUserId} />

      <main className="flex-1 flex flex-col bg-white overflow-hidden relative shadow-[-4px_0_24px_-16px_rgba(0,0,0,0.1)] z-0">
        <ChatHeader
          initials={initials}
          avatarColor={avatarColor}
          userName={selectedUser?.email}
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

        <MessageInput onSend={handleSend} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default Conversation;
