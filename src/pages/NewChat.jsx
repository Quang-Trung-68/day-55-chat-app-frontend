import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    useCreateConversationMutation,
    useCreateMessageMutation,
} from "@/store/api/conversationsApi";
import { getApiErrorMessage } from "@/utils/errors";
import { ROUTES, conversationUrl } from "@/config/routes";

function NewChat() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userId = parseInt(searchParams.get("userId"));
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    const [createConversation, { isLoading: createLoading }] = useCreateConversationMutation();
    const [createMessage, { isLoading: messageLoading }] = useCreateMessageMutation();

    const isLoading = createLoading || messageLoading;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const conversation = await createConversation({
                type: "dm",
                user_ids: [userId],
            }).unwrap();
            await createMessage({
                conversationId: conversation.id,
                type: "text",
                content,
            }).unwrap();
            navigate(conversationUrl(conversation.id));
        } catch (err) {
            setError(
                getApiErrorMessage(err, "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.")
            );
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 mt-10 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="mb-6">
                <Link
                    to={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Quay lại danh sách
                </Link>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
                Tin nhắn mới
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                        {error}
                    </p>
                )}
                <div className="flex gap-2">
                    <textarea
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 resize-none outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all shadow-sm placeholder:text-slate-400"
                        rows={3}
                        placeholder="Nhập tin nhắn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !content.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:transform-none font-medium self-end transition-all transform hover:-translate-y-0.5"
                    >
                        {isLoading ? "Đang gửi..." : "Gửi tin nhắn"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewChat;
