import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import socketClient from "@/socketClient";
import {
  useGetMessagesQuery,
  useCreateMessageMutation,
  conversationsApi,
} from "@/store/api/conversationsApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { getApiErrorMessage } from "@/utils/errors";

import Sidebar from "@/components/chat/Sidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

function Conversation() {
  const dispatch = useDispatch();
  const { id: conversationId } = useParams();
  const [error, setError] = useState("");

  const { data: messages = [] } = useGetMessagesQuery(conversationId, {
    skip: !conversationId,
  });

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

  useEffect(() => {
    if (!conversationId) return;
    const channelName = `conversation-${conversationId}`;
    const channel = socketClient.subscribe(channelName);

    channel.bind("created", (message) => {
      dispatch(
        conversationsApi.util.updateQueryData(
          "getMessages",
          conversationId,
          (draft) => {
            if (draft && draft.messages) {
              draft.messages.push(message);
            }
          },
        ),
      );
    });

    channel.bind_global((eventName, data) => {
      console.log("🔔 Event:", eventName, data);
    });

    return () => {
      channel.unbind_all();
      socketClient.unsubscribe(channelName);
    };
  }, [conversationId, dispatch]);

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
          messages={messages?.messages}
          initials={initials}
          avatarColor={avatarColor}
        />

        <MessageInput onSend={handleSend} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default Conversation;
