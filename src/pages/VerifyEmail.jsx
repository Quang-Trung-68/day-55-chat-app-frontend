import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getErrorMessageFromApiError } from "@/utils/errors";
import { useVerifyEmailMutation } from "@/store/api/authApi";
import { ROUTES } from "@/config/routes";

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [verifyEmail] = useVerifyEmailMutation();

    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Thiếu thông tin xác thực.");
            return;
        }

        verifyEmail({ token })
            .unwrap()
            .then((result) => {
                setStatus("success");
                setMessage(typeof result === "string" ? result : result?.message || "Xác thực thành công.");
                // Tự động điều hướng sau 3 giây
                setTimeout(() => {
                    navigate(ROUTES.LOGIN, { 
                        state: { message: "Xác thực thành công! Vui lòng đăng nhập." } 
                    });
                }, 3000);
            })
            .catch((err) => {
                setStatus("error");
                setMessage(getErrorMessageFromApiError(err));
            });
    }, [token, verifyEmail, navigate]);

    return (
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 w-full max-w-md relative z-10 mx-auto text-center">
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-3">
                        <span className="inline-block w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-slate-600">Đang xác thực...</p>
                    </div>
                )}

                {status === "success" && (
                    <>
                        <p className="text-emerald-600 font-medium mb-4">
                            Email đã được xác thực. Bạn có thể đăng nhập.
                        </p>
                        <Link
                            to={ROUTES.LOGIN}
                            className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium transform hover:-translate-y-0.5"
                        >
                            Đăng nhập
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <p className="text-red-600 font-medium mb-4">{message}</p>
                        <Link
                            to={ROUTES.HOME}
                            className="inline-block px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium transform hover:-translate-y-0.5"
                        >
                            Về trang chủ
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
