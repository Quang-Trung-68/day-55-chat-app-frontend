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
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 w-full max-w-md relative z-10 mx-auto">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 text-center mb-8 tracking-tight">
                    Đăng nhập
                </h1>

                {location.state?.message && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm text-center font-medium">
                        {location.state.message}
                    </div>
                )}

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
                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
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
                        className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
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
