import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ROUTES } from "@/config/routes";
import socketClient from "@/socketClient";
import {
    useGetMessagesQuery,
    useCreateMessageMutation,
    conversationsApi,
} from "@/store/api/conversationsApi";
import { getApiErrorMessage } from "@/utils/errors";

function Conversation() {
    const dispatch = useDispatch();
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const { id: conversationId } = useParams();
    const { data: messages = [] } = useGetMessagesQuery(conversationId, {
        skip: !conversationId,
    });
    const [createMessage, { isLoading }] = useCreateMessageMutation();

    useEffect(() => {
        if (!conversationId) return;
        const channel = socketClient.subscribe(`conversation-${conversationId}`);
        channel.bind("created", (message) => {
            dispatch(
                conversationsApi.util.updateQueryData(
                    "getMessages",
                    conversationId,
                    (draft) => {
                        draft.push(message);
                    }
                )
            );
        });
        return () => channel.unsubscribe();
    }, [conversationId, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = content;
        setContent("");
        setError("");
        try {
            await createMessage({
                conversationId,
                type: "text",
                content: text,
            }).unwrap();
        } catch (err) {
            setContent(text);
            setError(getApiErrorMessage(err, "Không thể gửi tin nhắn. Vui lòng thử lại."));
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="mb-4">
                <Link
                    to={ROUTES.HOME}
                    className="text-sm text-slate-600 hover:text-blue-600"
                >
                    ← Quay lại danh sách
                </Link>
            </div>

            <h1 className="text-2xl font-semibold text-slate-800 mb-4">
                Tin nhắn
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                {error && (
                    <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                        {error}
                    </p>
                )}
                <ul className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2">
                    {messages.map((message) => (
                        <li
                            key={message.id}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                        >
                            {message.content}
                        </li>
                    ))}
                </ul>
                <div className="flex gap-2 shrink-0">
                    <textarea
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Nhập tin nhắn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium self-end"
                    >
                        {isLoading ? "..." : "Gửi"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Conversation;
