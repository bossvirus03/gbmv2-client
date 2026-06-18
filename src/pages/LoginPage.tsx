import { useState, useEffect } from "react";
import apiService from "../services/api";

declare const google: any;

const LoginPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (googleResponse: any) => {
    setError("");
    setLoading(true);

    try {
      const response = await apiService.post("/auth/google", {
        credential: googleResponse.credential,
      });

      const data = response.data;

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "/";
      } else {
        setError("Đăng nhập bằng Google thất bại");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Xác thực Google thất bại. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn("Vui lòng cấu hình VITE_GOOGLE_CLIENT_ID trong file .env");
        return;
      }

      if (
        typeof google !== "undefined" &&
        document.getElementById("googleBtn")
      ) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleLogin,
        });

        google.accounts.id.renderButton(document.getElementById("googleBtn"), {
          theme: "filled_blue",
          size: "large",
          width: 320,
          text: "signin_with",
          shape: "pill",
        });
      }
    };

    initGoogle();

    const interval = setInterval(() => {
      if (
        typeof google !== "undefined" &&
        document.getElementById("googleBtn")
      ) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070913] relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/10 blur-[120px] animate-float-slow pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/10 blur-[120px] animate-float-medium pointer-events-none"></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-blue-500/5 rounded-[32px] blur-2xl pointer-events-none"></div>

        <div className="bg-[#0e1227]/40 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="p-8 pb-4 text-center">
            {/* Logo */}
            <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl rotate-6 opacity-30 blur-[4px]"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl rotate-12 opacity-20"></div>
              <div className="relative w-16 h-16 bg-[#0f142e] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="bg-gradient-to-tr from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent text-2xl font-black tracking-tight">
                  GBM
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Chào Mừng
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Hệ thống Quản lý GBM - Đăng nhập để tiếp tục
            </p>
          </div>

          {/* Action Area */}
          <div className="p-8 pt-4 pb-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3.5 rounded-2xl text-xs font-medium mb-6 animate-fade-in text-center">
                ⚠️ {error}
              </div>
            )}

            <div className="flex flex-col items-center justify-center py-6 w-full bg-white/5 border border-white/5 rounded-2xl shadow-inner min-h-[120px]">
              {/* Spinner: hiển thị khi loading */}
              <div
                className={`flex flex-col items-center gap-3 ${loading ? "" : "hidden"}`}
              >
                <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase">
                  Đang xác thực...
                </span>
              </div>

              {/* Google Button: luôn ở trong DOM, ẩn khi loading */}
              <div
                className={`w-full flex flex-col items-center gap-4 px-6 ${loading ? "hidden" : ""}`}
              >
                <div
                  id="googleBtn"
                  className="w-full flex justify-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                ></div>
                <p className="text-[11px] text-slate-500 text-center leading-normal">
                  Sử dụng tài khoản Gmail công việc đã được cấp quyền quản trị
                  viên.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-8 font-semibold tracking-wide">
          © 2026 GLOBAL BUSINESS MANAGER. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
