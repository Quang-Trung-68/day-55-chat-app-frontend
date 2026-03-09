import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/authSlice";
import useInfiniteScroll from "react-infinite-scroll-hook";

// ── CSS ───────────────────────────────────────────────────────
const CSS = `
@keyframes msgSlideIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1;   }
}
`;

function injectCSS() {
  if (document.getElementById("_ml")) return;
  const s = document.createElement("style");
  s.id = "_ml";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────
// Remount khi conversationId đổi (parent dùng key={conversationId})
// ─────────────────────────────────────────────────────────────
function MessageList({ messages, hasNextPage, loadingMore, onLoadMore }) {
  const currentUser = useSelector(selectCurrentUser);

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Scroll-preservation refs (dùng bởi useLayoutEffect) ────
  // Chỉ phát hiện prepend qua savedScrollHeightRef > 0
  // (được set bởi onLoadMore callback)
  const savedScrollTopRef = useRef(0);
  const savedScrollHeightRef = useRef(0);

  // ── Auto-scroll refs (dùng bởi useEffect) ──────────────────
  // Refs này CHỈ được update bên trong useEffect auto-scroll
  // để tránh bị useLayoutEffect update trước
  const prevLastIdRef = useRef(null);
  const prevCountRef = useRef(0);
  const wasNearBottomRef = useRef(true);

  // ── Double-trigger guard ──────────────────────────────────
  const loadLockRef = useRef(false);

  // ── Inject CSS ──────────────────────────────────────────────
  useEffect(injectCSS, []);

  // ── Infinite scroll hook ──────────────────────────────────
  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading: loadingMore,
    hasNextPage,
    onLoadMore: () => {
      if (loadLockRef.current) return;
      loadLockRef.current = true;

      // Snapshot scroll state TRƯỚC KHI React render
      const el = containerRef.current;
      if (el) {
        savedScrollTopRef.current = el.scrollTop;
        savedScrollHeightRef.current = el.scrollHeight;
      }

      onLoadMore();
    },
    rootMargin: "30px 0px 0px 0px",
    disabled: !hasNextPage,
  });

  // Mở khóa khi fetch xong
  useEffect(() => {
    if (!loadingMore && loadLockRef.current) {
      const t = setTimeout(() => {
        loadLockRef.current = false;
      }, 120);
      return () => clearTimeout(t);
    }
  }, [loadingMore]);

  // ── Merge refs ─────────────────────────────────────────────
  const setContainerRef = useCallback(
    (node) => {
      containerRef.current = node;
      rootRef(node);
    },
    [rootRef],
  );

  // ══════════════════════════════════════════════════════════════
  // ██  useLayoutEffect: GIỮ scroll position sau PREPEND      ██
  // ══════════════════════════════════════════════════════════════
  // Phát hiện prepend chỉ bằng savedScrollHeightRef > 0
  // (flag được set bởi onLoadMore callback trước khi React render).
  // KHÔNG update prevLastIdRef ở đây — để useEffect auto-scroll
  // có thể đọc giá trị cũ đúng.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || savedScrollHeightRef.current === 0) return;

    const heightDiff = el.scrollHeight - savedScrollHeightRef.current;
    if (heightDiff > 0) {
      el.scrollTop = savedScrollTopRef.current + heightDiff;
    }

    // Reset snapshot
    savedScrollHeightRef.current = 0;
    savedScrollTopRef.current = 0;
  }, [messages]);

  // ══════════════════════════════════════════════════════════════
  // ██  useEffect: Track scroll position                       ██
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const distFromBottom =
          el.scrollHeight - el.scrollTop - el.clientHeight;
        const nearBottom = distFromBottom <= 50;
        wasNearBottomRef.current = nearBottom;
        setShowScrollBtn(!nearBottom);
        if (nearBottom) setUnreadCount(0);
        ticking = false;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ══════════════════════════════════════════════════════════════
  // ██  useEffect: Auto-scroll khi có tin mới                  ██
  // ══════════════════════════════════════════════════════════════
  //
  // Logic:
  //  - Lần đầu vào conversation (prevCountRef === 0) → scroll xuống
  //  - Tin nhắn APPEND (lastId thay đổi):
  //      + Tin của mình → luôn scroll xuống
  //      + Tin người khác + user đang ở gần cuối (≤ 50px) → scroll xuống
  //      + Tin người khác + user đang cuộn lên xa (> 50px) → KHÔNG scroll
  //  - Tin nhắn PREPEND (load more) → KHÔNG scroll
  //    (phát hiện bằng: savedScrollHeightRef đã được xử lý ở useLayoutEffect,
  //     và lastId giữ nguyên)
  //
  useEffect(() => {
    if (!messages?.length) {
      // Reset refs khi messages trống (conversation mới)
      prevLastIdRef.current = null;
      prevCountRef.current = 0;
      return;
    }

    const lastMsg = messages[messages.length - 1];
    const lastId = lastMsg?.id;

    const isFirstLoad = prevCountRef.current === 0;
    const isNewMessage = !isFirstLoad && lastId !== prevLastIdRef.current;

    // Update refs TRƯỚC khi xử lý logic
    // (đặt ở đây vì useLayoutEffect KHÔNG update refs này)
    const oldLastId = prevLastIdRef.current;
    prevLastIdRef.current = lastId;
    prevCountRef.current = messages.length;

    // ── Lần đầu load ──
    if (isFirstLoad) {
      // Scroll xuống cuối ngay lập tức
      messagesEndRef.current?.scrollIntoView({
        behavior: "instant",
        block: "end",
      });
      setShowScrollBtn(false);
      return;
    }

    // ── Không có tin mới (ví dụ: prepend) ──
    if (!isNewMessage) return;

    // ── Có tin mới ở cuối (APPEND) ──
    const isMine = lastMsg?.user_id === currentUser?.id;

    if (isMine) {
      // Tin của mình → luôn scroll xuống
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      setShowScrollBtn(false);
      setUnreadCount(0);
    } else if (wasNearBottomRef.current) {
      // Tin người khác + user ở gần cuối → scroll xuống
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      setShowScrollBtn(false);
      setUnreadCount(0);
    } else {
      // Tin người khác + user đang cuộn lên → KHÔNG scroll, đếm tin chưa đọc
      setUnreadCount((n) => n + 1);
    }
  }, [messages, currentUser?.id]);

  // ── Scroll to bottom button ───────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    setShowScrollBtn(false);
    setUnreadCount(0);
  };

  // ────────────────────────── RENDER ─────────────────────────
  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={setContainerRef}
        className="absolute inset-0 overflow-y-auto p-6 flex flex-col gap-2"
        style={{ overscrollBehavior: "contain", overflowAnchor: "none" }}
      >
        {/* Sentry — chiều cao cố định */}
        <div
          ref={sentryRef}
          style={{
            height: 36,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: loadingMore ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <DotsLoader />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Đang tải...</span>
          </div>
        </div>

        {/* Messages */}
        {messages?.map((msg, i) => {
          const isMine = msg.user_id === currentUser?.id;
          // Chỉ animate 2 tin nhắn cuối cùng
          const animate = i >= messages.length - 2;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                animation: animate
                  ? "msgSlideIn 0.15s ease-out both"
                  : undefined,
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "10px 16px",
                  borderRadius: 18,
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  ...(isMine
                    ? {
                        background:
                          "linear-gradient(135deg, #3b82f6, #2563eb)",
                        color: "#fff",
                        borderBottomRightRadius: 5,
                      }
                    : {
                        background: "#f3f4f6",
                        color: "#1f2937",
                        borderBottomLeftRadius: 5,
                      }),
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} style={{ height: 1 }} />
      </div>

      {/* Scroll-to-bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: `translateX(-50%) translateY(${showScrollBtn ? 0 : 10}px)`,
          opacity: showScrollBtn ? 1 : 0,
          pointerEvents: showScrollBtn ? "auto" : "none",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          zIndex: 10,
        }}
      >
        <button
          onClick={scrollToBottom}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: 34,
            borderRadius: 999,
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(8px)",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
            cursor: "pointer",
            color: "#6b7280",
            fontSize: 13,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.14)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.10)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 5.5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {unreadCount > 0 && <span>{unreadCount} tin mới</span>}
        </button>
      </div>
    </div>
  );
}

// ── Dots loader ──────────────────────────────────────────────
function DotsLoader() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#93c5fd",
            animation: `dotPulse 1.1s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default MessageList;
