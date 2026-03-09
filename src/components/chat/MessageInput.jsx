import { useRef, useState } from "react";

function MessageInput({ onSend, isLoading }) {
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

  const resize = (el) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    resize(e.target);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    onSend(text);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 px-6 flex-shrink-0 z-10 sticky bottom-0">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 max-w-5xl mx-auto"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Nhập tin nhắn... (Enter để gửi)"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14.5px] text-slate-900 resize-none outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all leading-relaxed shadow-sm"
          style={{ maxHeight: "160px", overflowY: "auto" }}
        />
        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className={`w-12 h-12 min-w-[48px] rounded-2xl flex flex-shrink-0 items-center justify-center transition-all duration-200 ${
            isLoading || !content.trim()
              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              : "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="ml-0.5 mt-0.5"
            >
              <path d="m22 2-7 20-4-9-9-4 20-7z" />
              <path d="M22 2 11 13" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
