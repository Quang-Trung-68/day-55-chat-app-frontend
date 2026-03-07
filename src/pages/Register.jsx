import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessageFromApiError } from "@/utils/errors";
import { useRegisterMutation } from "@/store/api/authApi";
import { ROUTES } from "@/config/routes";

function Register() {
    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await register({ email, password }).unwrap();
            navigate(ROUTES.HOME, {
                state: {
                    message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
                },
            });
        } catch (err) {
            setError(getErrorMessageFromApiError(err));
        }
    };

    return (
        <div className="max-w-sm mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h1 className="text-xl font-semibold text-slate-800 text-center mb-6">
                    Đăng ký
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                        {isLoading ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600">
                    Đã có tài khoản?{" "}
                    <Link to={ROUTES.LOGIN} className="text-blue-600 hover:underline font-medium">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
