import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    getErrorMessageFromApiError,
    ERROR_VERIFY_EMAIL,
    RESEND_SUCCESS_MESSAGE,
} from "@/utils/errors";
import { useLoginMutation, useResendVerificationEmailMutation } from "@/store/api/authApi";
import { apiSlice } from "@/store/api/apiSlice";
import { ROUTES } from "@/config/routes";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();
    const [resendVerificationEmail, { isLoading: isResending }] =
        useResendVerificationEmailMutation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [resendMessage, setResendMessage] = useState("");

    const isVerifyEmailError = error === ERROR_VERIFY_EMAIL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResendMessage("");

        try {
            const data = await login({ email, password }).unwrap();
            const { access_token, refresh_token } = data;
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);

            await dispatch(
                apiSlice.endpoints.getMe.initiate(undefined, { forceRefetch: true })
            ).unwrap();

            const from = location.state?.from || ROUTES.HOME;
            navigate(from, { replace: true });
        } catch (err) {
            setError(getErrorMessageFromApiError(err));
        }
    };

    const handleResendVerification = async () => {
        setResendMessage("");
        try {
            await resendVerificationEmail({ email, password }).unwrap();
            setResendMessage(RESEND_SUCCESS_MESSAGE);
        } catch (err) {
            setResendMessage(
                getErrorMessageFromApiError(err, "Không thể gửi. Vui lòng thử lại.")
            );
        }
    };

    return (
        <div className="max-w-sm mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h1 className="text-xl font-semibold text-slate-800 text-center mb-6">
                    Đăng nhập
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
                        <div className="space-y-2">
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                                {error}
                            </p>
                            {isVerifyEmailError && (
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                                >
                                    {isResending ? "Đang gửi..." : "Gửi lại email xác minh"}
                                </button>
                            )}
                            {resendMessage && (
                                <p
                                    className={`text-sm p-2 rounded-lg ${
                                        resendMessage === RESEND_SUCCESS_MESSAGE
                                            ? "text-emerald-700 bg-emerald-50"
                                            : "text-red-600 bg-red-50"
                                    }`}
                                >
                                    {resendMessage}
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600">
                    Chưa có tài khoản?{" "}
                    <Link to={ROUTES.REGISTER} className="text-blue-600 hover:underline font-medium">
                        Đăng ký
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
