import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLazySearchUsersQuery } from "@/store/api/usersApi";
import {
  useCreateConversationMutation,
  conversationsApi,
} from "@/store/api/conversationsApi";
import { conversationUrl } from "@/config/routes";
import { useDispatch } from "react-redux";

const DEBOUNCE_MS = 300;

const SearchDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);

  const [triggerSearch] = useLazySearchUsersQuery();
  const [createConversation] = useCreateConversationMutation();

  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Perform search
  const doSearch = useCallback(
    async (searchQuery) => {
      try {
        const { data } = await triggerSearch(searchQuery, false);
        if (data) setResults(data);
      } catch {
        // Ignore errors silently
      }
    },
    [triggerSearch]
  );

  // On focus: search immediately with current query
  const handleFocus = () => {
    setIsOpen(true);
    doSearch(query);
  };

  // On input change: debounce then search
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, DEBOUNCE_MS);
  };

  // Click outside → close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Click a user → createConversation → navigate → đẩy conversation lên đầu sidebar
  const handleSelectUser = async (user) => {
    setIsOpen(false);
    setQuery("");
    setResults([]);

    try {
      const result = await createConversation({
        name: "abcd",
        type: "dm",
        user_ids: [parseInt(user.id)],
      }).unwrap();

      const conversationId = result.id;

      // Đẩy conversation lên đầu danh sách trong cache sidebar
      dispatch(
        conversationsApi.util.updateQueryData(
          "getConversations",
          undefined,
          (draft) => {
            const idx = draft.findIndex(
              (c) => c.conversation_id === conversationId
            );
            if (idx === -1) {
              // Conversation chưa có trong list → thêm vào đầu
              draft.unshift({ ...result, latest_message: null });
            } else if (idx > 0) {
              // Conversation đã có nhưng không ở đầu → đưa lên đầu
              const [item] = draft.splice(idx, 1);
              draft.unshift(item);
            }
          }
        )
      );

      navigate(conversationUrl(conversationId), {
        state: { selectedUserId: user.id },
      });
    } catch {
      // Ignore errors
    }
  };

  const initials = (name) =>
    (name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      {/* Search input */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">
              Không tìm thấy người dùng
            </div>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                onMouseDown={(e) => {
                  // Dùng onMouseDown thay vì onClick để tránh input blur trước khi click xử lý
                  e.preventDefault();
                  handleSelectUser(user);
                }}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {initials(user.name)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {user.name || "Unnamed"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
