import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Terminal,
  Search,
  Trash2,
  Download,
  RefreshCw,
  AlertTriangle,
  Bug,
  Info,
  Scroll,
  Wifi,
  ChevronRight,
  ChevronDown,
  XCircle,
} from "lucide-react";
import { API_BASE_URL } from "../services/api";
import { getAccessToken } from "../lib/asyncLocalstoragate";

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
}

const SystemLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLogIndices, setExpandedLogIndices] = useState<Set<number>>(new Set());

  // Ref to log container for auto-scrolling
  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Available log levels for filtering
  const allLevels = ["log", "error", "warn", "debug", "verbose"];

  // Establish SSE connection
  const connectLogs = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus("connecting");
    const token = getAccessToken();
    const url = `${API_BASE_URL}/logs/stream?token=${encodeURIComponent(token || "")}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setStatus("connected");
    };

    es.onmessage = (event) => {
      try {
        const entry: LogEntry = JSON.parse(event.data);
        setLogs((prev) => {
          // Keep a limit on the UI side as well to prevent memory issues (e.g. 1000 logs)
          const newLogs = [...prev, entry];
          if (newLogs.length > 1000) {
            newLogs.shift();
          }
          return newLogs;
        });
      } catch (err) {
        console.error("Error parsing stream log:", err);
      }
    };

    es.onerror = () => {
      setStatus("disconnected");
      es.close();
    };
  };

  useEffect(() => {
    connectLogs();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Handle auto scroll
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Toggle log level filter
  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  };

  // Clear filtered list
  const clearLogsScreen = () => {
    setLogs([]);
    setExpandedLogIndices(new Set());
  };

  // Toggle expand log row (for stack traces / large objects)
  const toggleExpand = (index: number) => {
    setExpandedLogIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.context && log.context.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLevel =
        selectedLevels.length === 0 || selectedLevels.includes(log.level.toLowerCase());

      return matchesSearch && matchesLevel;
    });
  }, [logs, searchQuery, selectedLevels]);

  // Statistics
  const stats = useMemo(() => {
    const counts: { [key: string]: number } = {
      log: 0,
      error: 0,
      warn: 0,
      debug: 0,
      verbose: 0,
    };
    logs.forEach((log) => {
      const lvl = log.level.toLowerCase();
      if (counts[lvl] !== undefined) {
        counts[lvl]++;
      }
    });
    return counts;
  }, [logs]);

  // Download logs as file
  const downloadLogs = () => {
    const content = filteredLogs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.context ? `[${log.context}] ` : ""
          }${log.message}`,
      )
      .join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backend-logs-${new Date().toISOString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helpers for log levels styling
  const getLevelStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return {
          bg: "bg-red-500/10 border-red-500/20",
          text: "text-red-400",
          badge: "bg-red-500/20 text-red-300 border-red-500/30",
          icon: XCircle,
        };
      case "warn":
        return {
          bg: "bg-amber-500/10 border-amber-500/20",
          text: "text-amber-400",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: AlertTriangle,
        };
      case "debug":
        return {
          bg: "bg-fuchsia-500/10 border-fuchsia-500/20",
          text: "text-fuchsia-400",
          badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
          icon: Bug,
        };
      case "verbose":
        return {
          bg: "bg-slate-500/10 border-slate-500/20",
          text: "text-slate-400",
          badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
          icon: Info,
        };
      case "log":
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20",
          text: "text-emerald-400",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          icon: Info,
        };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] text-slate-100 bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-[#0b0f19] border-b border-slate-800 gap-4">
        {/* Title and Connection Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Terminal size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-200 tracking-wider">LOGS HỆ THỐNG</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "connected"
                    ? "bg-emerald-400"
                    : status === "connecting"
                      ? "bg-amber-400"
                      : "bg-red-400"
                    }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${status === "connected"
                    ? "bg-emerald-500"
                    : status === "connecting"
                      ? "bg-amber-500"
                      : "bg-red-500"
                    }`}
                ></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {status === "connected"
                  ? "Đã kết nối"
                  : status === "connecting"
                    ? "Đang kết nối..."
                    : "Mất kết nối"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {status !== "connected" && (
            <button
              onClick={connectLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <RefreshCw size={13} className={status === "connecting" ? "animate-spin" : ""} />
              Kết nối lại
            </button>
          )}

          <button
            onClick={downloadLogs}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 disabled:cursor-not-allowed rounded-lg text-xs font-semibold border border-slate-700 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Tải logs"
          >
            <Download size={13} />
            Tải logs ({filteredLogs.length})
          </button>

          <button
            onClick={clearLogsScreen}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 rounded-lg text-xs font-semibold border border-rose-900/40 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Clear logs"
          >
            <Trash2 size={13} />
            Clear logs
          </button>

          <button
            onClick={() => setAutoScroll((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${autoScroll
              ? "bg-indigo-650/40 text-indigo-300 border-indigo-800/40 shadow-inner"
              : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
          >
            <Scroll size={13} className={autoScroll ? "text-indigo-400" : ""} />
            Cuộn tự động: {autoScroll ? "BẬT" : "TẮT"}
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-3.5 bg-[#0b0f19]/70 border-b border-slate-800 gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm log hoặc context..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1.5">Lọc level:</span>
          {allLevels.map((lvl) => {
            const isSelected = selectedLevels.includes(lvl);
            const style = getLevelStyle(lvl);
            return (
              <button
                key={lvl}
                onClick={() => toggleLevel(lvl)}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase transition-all duration-200 cursor-pointer ${isSelected
                  ? `${style.text} ${style.bg} border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.1)]`
                  : "bg-slate-900/40 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400"
                  }`}
              >
                {lvl} ({stats[lvl] || 0})
              </button>
            );
          })}
          {selectedLevels.length > 0 && (
            <button
              onClick={() => setSelectedLevels([])}
              className="px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
            >
              Reset bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Terminal logs list */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed bg-[#020617] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
            <Scroll size={36} className="text-slate-650 opacity-40 mb-3 animate-pulse" />
            <p className="font-semibold text-sm">Chưa có logs hệ thống hiển thị</p>
            <p className="text-xs text-slate-600 mt-1">Đang chờ sự kiện hoặc không khớp với bộ lọc.</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const style = getLevelStyle(log.level);
            const isExpanded = expandedLogIndices.has(index);
            const hasLongMessage = log.message.length > 150 || log.message.includes("\n");

            return (
              <div
                key={index}
                className={`group border rounded-lg p-2.5 hover:bg-slate-900/35 transition-all duration-150 border-slate-900/40 hover:border-slate-800 ${style.bg
                  }`}
              >
                {/* Main line info */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-between">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    {/* Timestamp */}
                    <span className="text-slate-500 text-[11px] font-medium whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>

                    {/* Level badge */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${style.badge
                        }`}
                    >
                      {log.level}
                    </span>

                    {/* Context badge if present */}
                    {log.context && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-indigo-300 border border-slate-800">
                        {log.context}
                      </span>
                    )}

                    {/* Message snippet */}
                    <span
                      onClick={() => hasLongMessage && toggleExpand(index)}
                      className={`text-slate-300 break-all ${hasLongMessage ? "cursor-pointer hover:text-white" : ""
                        }`}
                    >
                      {hasLongMessage && !isExpanded ? (
                        <>
                          {log.message.slice(0, 150)}...
                          <span className="text-[10px] text-indigo-400 ml-1.5 font-bold hover:underline">
                            (Xem thêm)
                          </span>
                        </>
                      ) : (
                        log.message
                      )}
                    </span>
                  </div>

                  {/* Right side options */}
                  {hasLongMessage && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="text-slate-500 hover:text-slate-300 p-0.5 hover:bg-slate-800/80 rounded transition-colors self-end md:self-auto cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                </div>

                {/* Expanded Details Section */}
                {isExpanded && hasLongMessage && (
                  <div className="mt-2.5 p-3 bg-slate-950 border border-slate-800 rounded-md text-slate-400 text-[11px] whitespace-pre-wrap overflow-x-auto select-text break-all">
                    {log.message}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer Info */}
      <div className="p-2 px-4 bg-[#0b0f19] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Wifi size={12} className={status === "connected" ? "text-emerald-500" : "text-slate-550"} />
          <span>Thời gian thực: {status === "connected" ? "Đang bật" : "Tạm dừng"}</span>
        </div>
        <div>
          <span>Tổng log hiển thị: {filteredLogs.length}/{logs.length}</span>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsPage;
