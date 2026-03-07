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
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-4">
                <Link
                    to={ROUTES.HOME}
                    className="text-sm text-slate-600 hover:text-blue-600"
                >
                    ← Quay lại danh sách
                </Link>
            </div>

            <h1 className="text-2xl font-semibold text-slate-800 mb-4">
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
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Nhập tin nhắn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium self-end"
                    >
                        {isLoading ? "Đang gửi..." : "Gửi"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewChat;
