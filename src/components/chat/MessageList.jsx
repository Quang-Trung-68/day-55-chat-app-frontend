import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/authSlice";
import useInfiniteScroll from "react-infinite-scroll-hook";

function MessageList({ messages, hasNextPage, loadingMore, onLoadMore }) {
  const currentUser = useSelector(selectCurrentUser);

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const prevMessagesLengthRef = useRef(0);
  const wasNearBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);

  // Track scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      const nearBottom = distanceFromBottom <= 50;
      wasNearBottomRef.current = nearBottom;

      if (nearBottom) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNewMessage =
      (messages?.length || 0) > prevMessagesLengthRef.current;
    const isFirstLoad =
      prevMessagesLengthRef.current === 0 && messages?.length > 0;

    if (isNewMessage || isFirstLoad) {
      const lastMessage = messages?.[messages.length - 1];
      const isMine = lastMessage?.user_id === currentUser?.id;
      const shouldScroll = wasNearBottomRef.current || isMine || isFirstLoad;
      if (!isMine) {
        setUnreadMessages((prev) => prev + 1);
      } else {
        setUnreadMessages(0);
      }

      if (shouldScroll) {
        messagesEndRef.current?.scrollIntoView({
          behavior: isMine ? "auto" : "smooth",
        });
        setShowScrollButton(false);
        setUnreadMessages(0);
      }
    }

    prevMessagesLengthRef.current = messages?.length || 0;
  }, [messages, currentUser?.id]);

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

    // Đợi scroll animation xong mới ẩn nút
    const handleScrollEnd = () => {
      setShowScrollButton(false);
      container.removeEventListener("scrollend", handleScrollEnd);
      setUnreadMessages(0);
    };

    container.addEventListener("scrollend", handleScrollEnd);
  };

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        className="absolute inset-0 flex-1 overflow-y-auto p-6 flex flex-col gap-4"
      >
        {messages?.map((message) => {
          const isMine = message.user_id === currentUser?.id;

          return (
            <div
              key={message.id}
              className={`max-w-[80%] ${isMine ? "self-end" : "self-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-xl text-sm ${
                  isMine
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-5 right-[50%] translate-x-1/2 flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/90 backdrop-blur-sm text-gray-500 shadow-md border border-gray-100 hover:bg-white hover:text-gray-700 hover:shadow-lg transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {unreadMessages > 0 && (
            <span className="text-xs font-medium text-gray-600">
              {unreadMessages} tin nhắn mới
            </span>
          )}
        </button>
      )}
    </div>
  );
}

export default MessageList;
