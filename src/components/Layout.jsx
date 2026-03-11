import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser, selectCurrentUser } from "@/store/authSlice";
import { ROUTES } from "@/config/routes";

function Layout() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(clearUser());
    dispatch({ type: "store/reset" });
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <nav className="max-w-full mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to={ROUTES.HOME}
            className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            Demo Chat
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={ROUTES.HOME}
                  className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                    location.pathname === ROUTES.HOME
                      ? "bg-slate-100 text-slate-800 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Trang chủ
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-colors"
                >
                  Đăng xuất
                </button>
                <div className="flex flex-col items-end justify-center ml-2 mr-1">
                  <span className="text-[14px] font-semibold text-slate-800 max-w-[160px] md:max-w-[200px] truncate leading-tight">
                    {user.name || "Người dùng"}
                  </span>
                  {user.email && user.email !== user.name && (
                    <span className="text-[11px] text-slate-500 max-w-[160px] md:max-w-[200px] truncate leading-tight">
                      {user.email}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === ROUTES.LOGIN
                      ? "bg-blue-50/80 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-100/80 font-medium"
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium transform hover:-translate-y-0.5"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
