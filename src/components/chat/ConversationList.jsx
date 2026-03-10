import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  useGetConversationsQuery,
  conversationsApi,
} from "@/store/api/conversationsApi";
import socketClient from "@/socketClient";
import ConversationItem from "./ConversationItem";

const ConversationList = () => {
  const dispatch = useDispatch();
  const { data: conversations = [], isLoading } = useGetConversationsQuery();

  // Subscribe vào tất cả conversation channels sau khi có danh sách
  useEffect(() => {
    if (!conversations.length) return;

    const handlers = [];
    const typingTimeouts = {}; // Lưu trữ timeout để reset typing state

    conversations.forEach(({ conversation_id }) => {
      const channelName = `conversation-${conversation_id}`;
      const channel = socketClient.subscribe(channelName);

      const handleNewMessage = (message) => {
        // 1. Cập nhật data "getLatestMessage" để Item tự động re-render message mới
        dispatch(
          conversationsApi.util.updateQueryData(
            "getLatestMessage",
            conversation_id, // arg match
            (draft) => {
              Object.assign(draft, message);
            }
          )
        );

        // 2. Thay đổi vị trí (đưa lên đầu) trong List getConversations
        dispatch(
          conversationsApi.util.updateQueryData(
            "getConversations",
            undefined, // arg match
            (draft) => {
              // Tìm conversation cần cập nhật
              const idx = draft.findIndex(
                (c) => c.conversation_id === conversation_id,
              );
              if (idx === -1) return;

              // Tính toán activeId từ URL tĩnh thay vì hook (vì hook không an toàn trong websocket callback)
              const pathMatch = window.location.pathname.match(/\/chat\/([^/]+)/);
              const activeIdPath = pathMatch ? pathMatch[1] : null;
              
              if (activeIdPath !== String(conversation_id)) {
                draft[idx].unread = true; // Bật cờ chưa đọc nếu ko ở hội thoại này
              }
              draft[idx].isTyping = false; // Nhận được tin nhắn thì mất "Đang nhập..."

              // Đưa conversation đó lên đầu danh sách
              const [updated] = draft.splice(idx, 1);
              draft.unshift(updated);
            },
          ),
        );
      };

      const handleTypingEvent = (data) => {
        // Tự động gán/xóa cờ isTyping trên cache danh sách
        dispatch(
          conversationsApi.util.updateQueryData("getConversations", undefined, (draft) => {
            const idx = draft.findIndex((c) => c.conversation_id === conversation_id);
            if (idx !== -1) draft[idx].isTyping = true;
          })
        );

        // Hủy bỏ timeout reset cũ nếu có liên tiếp sự kiện gõ
        if (typingTimeouts[conversation_id]) {
          clearTimeout(typingTimeouts[conversation_id]);
        }

        // Tạo 1 timeout 3s để tự tắt trạng thái gõ nếu ko có thêm tương tác
        typingTimeouts[conversation_id] = setTimeout(() => {
          dispatch(
            conversationsApi.util.updateQueryData("getConversations", undefined, (draft) => {
              const idx = draft.findIndex((c) => c.conversation_id === conversation_id);
              if (idx !== -1) draft[idx].isTyping = false;
            })
          );
        }, 3000);
      };

      channel.bind("created", handleNewMessage);
      channel.bind("client-typing", handleTypingEvent); // Soketi built-in client events
      handlers.push({ channel, handleNewMessage, handleTypingEvent });
    });

    return () => {
      // Clear all active timeouts
      Object.values(typingTimeouts).forEach(clearTimeout);

      // Chỉ gỡ callback này, giữ lại channel cho component khác nếu cần
      handlers.forEach(({ channel, handleNewMessage, handleTypingEvent }) => {
        channel.unbind("created", handleNewMessage);
        channel.unbind("client-typing", handleTypingEvent);
      });
    };
  }, [conversations.length, dispatch]); // Re-run nếu số lượng conversations thay đổi

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.conversation_id}
          conversationUser={conversation}
        />
      ))}
    </div>
  );
};

export default ConversationList;
