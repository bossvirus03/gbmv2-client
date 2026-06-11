import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, Loader2, Upload, Download } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ProgressState {
  show: boolean;
  title: string;
  value: number; // 0 to 100
  type: "upload" | "download" | "generic";
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  progress: {
    show: (title: string, type?: "upload" | "download" | "generic") => void;
    update: (value: number) => void;
    hide: () => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [progressState, setProgressState] = useState<ProgressState>({
    show: false,
    title: "",
    value: 0,
    type: "generic",
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự động xoá sau 3.5s
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const showProgress = useCallback((title: string, type: "upload" | "download" | "generic" = "generic") => {
    setProgressState({
      show: true,
      title,
      value: 0,
      type,
    });
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgressState((prev) => ({ ...prev, value: Math.min(100, Math.max(0, value)) }));
  }, []);

  const hideProgress = useCallback(() => {
    setProgressState((prev) => ({ ...prev, show: false }));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toast: {
          success: (msg) => addToast(msg, "success"),
          error: (msg) => addToast(msg, "error"),
          info: (msg) => addToast(msg, "info"),
        },
        progress: {
          show: showProgress,
          update: updateProgress,
          hide: hideProgress,
        },
      }}
    >
      {children}

      {/* TOAST CONTAINER CONTAINER */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3.5 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const typeConfig = {
            success: {
              wrapperClass: "bg-white/95 border-gray-100/70 shadow-[0_15px_35px_rgba(0,0,0,0.04),_0_1px_4px_rgba(0,0,0,0.01)]",
              iconWrapperClass: "bg-emerald-50 text-emerald-600 border-emerald-100/30",
              progressClass: "bg-emerald-500/20",
              Icon: CheckCircle2,
            },
            error: {
              wrapperClass: "bg-white/95 border-gray-100/70 shadow-[0_15px_35px_rgba(0,0,0,0.04),_0_1px_4px_rgba(0,0,0,0.01)]",
              iconWrapperClass: "bg-rose-50 text-rose-600 border-rose-100/30",
              progressClass: "bg-rose-500/20",
              Icon: AlertCircle,
            },
            info: {
              wrapperClass: "bg-white/95 border-gray-100/70 shadow-[0_15px_35px_rgba(0,0,0,0.04),_0_1px_4px_rgba(0,0,0,0.01)]",
              iconWrapperClass: "bg-blue-50 text-blue-600 border-blue-100/30",
              progressClass: "bg-blue-500/20",
              Icon: Info,
            },
          }[t.type];

          const { wrapperClass, iconWrapperClass, progressClass, Icon } = typeConfig;

          return (
            <div
              key={t.id}
              className={`relative flex items-center gap-4.5 p-4 pl-5 rounded-3xl border backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-x-0 animate-slide-in overflow-hidden ${wrapperClass}`}
            >
              {/* Icon wrapper with soft pastel background */}
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 border ${iconWrapperClass}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-[13px] font-semibold text-gray-700 leading-snug">{t.message}</p>
              </div>

              {/* Close button */}
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1.5 rounded-xl hover:bg-gray-100/80 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Countdown Progress Bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.75 animate-toast-shrink ${progressClass}`} />
            </div>
          );
        })}
      </div>

      {/* PROGRESS BAR PANEL (GÓC DƯỚI BÊN PHẢI) */}
      {progressState.show && (
        <div className="fixed bottom-5 right-5 z-[9998] p-1 animate-slide-in pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 w-80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/70 space-y-4">
            <div className="flex items-center gap-3.5">
              {/* Animated Icon Container */}
              <div className="w-10 h-10 rounded-2xl bg-blue-50/75 border border-blue-100/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                {progressState.type === "upload" ? (
                  <Upload className="w-5 h-5 animate-pulse" />
                ) : progressState.type === "download" ? (
                  <Download className="w-5 h-5 animate-bounce" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-bold text-gray-800 truncate">{progressState.title}</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">
                  {progressState.type === "upload" ? "Đang tải lên hệ thống" : progressState.type === "download" ? "Đang chuẩn bị file tải về" : "Đang xử lý dữ liệu"}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 font-mono">
                {Math.round(progressState.value)}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="space-y-2">
              <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden relative border border-gray-100/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out shimmer-progress"
                  style={{ 
                    width: `${progressState.value}%`,
                    backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
                    backgroundSize: '1rem 1rem'
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                <span className="animate-pulse">
                  {progressState.value < 100 ? "Vui lòng đợi..." : "Hoàn tất!"}
                </span>
                <span>
                  {Math.round(progressState.value)}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
