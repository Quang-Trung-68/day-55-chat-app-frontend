import { Link, useLocation } from "react-router-dom";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { newChatUrl } from "@/config/routes";

function Home() {
    const { data: users = [], isLoading } = useGetUsersQuery();
    const { state } = useLocation();

    return (
        <div className="max-w-2xl mx-auto p-6">
            {state?.message && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
                    {state.message}
                </div>
            )}

            <h1 className="text-2xl font-semibold text-slate-800 mb-4">
                Chọn người để chat
            </h1>

            {isLoading ? (
                <div className="flex items-center gap-2 text-slate-500">
                    <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                    Đang tải...
                </div>
            ) : users.length === 0 ? (
                <p className="text-slate-500 py-8">Chưa có người dùng nào.</p>
            ) : (
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li key={user.id}>
                            <Link
                                to={newChatUrl(user.id)}
                                className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                            >
                                <span className="text-slate-800 font-medium">
                                    {user.email}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Home;
