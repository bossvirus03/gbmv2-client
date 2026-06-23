import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  Users,
  UserCog,
  DollarSign,
  Receipt,
  BarChart3,
  Menu,
  Settings,
  LogOut,
  ChevronDown,
  Calculator,
  PlusCircle,
  Terminal,
  HardDrive,
  RefreshCw,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { getAccessToken, clearAccessToken } from "../lib/asyncLocalstoragate";
import { useR2StorageQuery, useRefreshR2StorageMutation } from "../hooks/useR2Storage";

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const R2StorageWidget = () => {
  const { data: stats, isLoading, error } = useR2StorageQuery();
  const refreshMutation = useRefreshR2StorageMutation();

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault();
    refreshMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-2xl flex items-center justify-between text-[11px] text-slate-400 mx-2 my-1">
        <span className="flex items-center gap-2">
          <HardDrive size={13} className="animate-pulse text-indigo-400" />
          Đang tải dung lượng R2...
        </span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-2xl flex items-center justify-between text-[11px] text-rose-400 mx-2 my-1">
        <span className="flex items-center gap-2">
          <HardDrive size={13} />
          Lỗi tải dung lượng R2
        </span>
      </div>
    );
  }

  const isRefreshing = refreshMutation.isPending;
  const isNearLimit = stats.usedPercentage >= 85;
  const isCritical = stats.usedPercentage >= 95;

  let progressColor = "bg-gradient-to-r from-blue-500 to-indigo-500";
  if (isCritical) {
    progressColor = "bg-gradient-to-r from-red-500 to-rose-600";
  } else if (isNearLimit) {
    progressColor = "bg-gradient-to-r from-amber-500 to-orange-500";
  }

  return (
    <div className="p-3 bg-slate-900/50 border border-slate-800/40 rounded-2xl shadow-lg backdrop-blur-md mx-2 my-1">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-slate-300">
          <HardDrive size={13} className={isRefreshing ? "text-indigo-400 animate-spin" : "text-indigo-400"} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Lưu trữ R2</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-slate-500 hover:text-slate-300 disabled:opacity-50 p-1 hover:bg-slate-850/60 rounded-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          title="Làm mới"
        >
          <RefreshCw size={10} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="w-full bg-slate-850 rounded-full h-1 overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(100, stats.usedPercentage)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
        <span className="text-slate-400 font-bold">
          {formatBytes(stats.usedBytes)} / {stats.maxGb} GB
        </span>
        <span className={isCritical ? "text-red-400 font-black animate-pulse" : isNearLimit ? "text-amber-400 font-bold" : "text-slate-300 font-bold"}>
          {stats.usedPercentage}%
        </span>
      </div>
    </div>
  );
};

const menuGroups = [
  {
    title: "Tổng quan",
    items: [
      { name: "Trang chủ", path: "/", icon: Home },
      { name: "Thống kê", path: "/statistic", icon: BarChart3 },
    ],
  },
  {
    title: "Giao dịch",
    items: [
      { name: "Tạo đơn hàng", path: "/create-order", icon: PlusCircle },
      { name: "Quỹ tiền", path: "/fund", icon: DollarSign },
      { name: "Chi phí", path: "/expense", icon: Receipt },
    ],
  },
  {
    title: "Quản lý",
    items: [
      { name: "Lô hàng", path: "/batch", icon: Package },
      { name: "Khách hàng", path: "/customer", icon: Users },
      { name: "Người dùng", path: "/user", icon: UserCog },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { name: "Công thức tính", path: "/formulas", icon: Calculator },
      { name: "Cài đặt", path: "/settings", icon: Settings },
      { name: "Logs hệ thống", path: "/system-logs", icon: Terminal },
    ],
  },
];

const SidebarLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("Nguyễn Văn A");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const token = getAccessToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const payload = JSON.parse(jsonPayload);
        if (payload) {
          if (payload.username) setUsername(payload.username);
          if (payload.avatar) setAvatarUrl(payload.avatar);
        }
      } catch (e) {
        console.error("Lỗi giải mã token:", e);
      }
    }
  }, []);

  const handleLogoutClick = () => {
    clearAccessToken();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-64 flex-col bg-[#0b0f19] border-r border-slate-900/60 shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-20">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-900/60 bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0f142e] border border-slate-800 rounded-xl flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300 hover:scale-105 hover:rotate-3 cursor-pointer">
              <img src="/logo.svg" alt="LM Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-slate-100 tracking-wider leading-none">LM Dashboard</h1>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[8px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">v2.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h3 className="px-3 text-[10px] font-bold text-slate-500/80 uppercase tracking-widest mb-2">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-300 ease-in-out group transform
                        ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white border-indigo-500/30 shadow-[0_4px_12px_rgba(99,102,241,0.25)] translate-x-1"
                            : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border-transparent hover:translate-x-1"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            size={16}
                            className={`transition-colors duration-300 ${
                              isActive
                                ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]"
                                : "text-slate-500 group-hover:text-indigo-400"
                            }`}
                          />
                          <span>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* R2 Storage Stats */}
        <div className="px-4 py-2 border-t border-slate-900/60 bg-[#0b0f19]">
          <R2StorageWidget />
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-900/60 bg-[#0b0f19]">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/50 border border-slate-800/40 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2.5 truncate">
              <Avatar className="h-8 w-8 ring-1 ring-indigo-500/30">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[10px]">
                  {getInitials(username)}
                </AvatarFallback>
              </Avatar>
              <div className="truncate">
                <p className="font-semibold text-xs text-slate-200 truncate leading-tight">
                  {username}
                </p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                  Quản trị viên
                </p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all duration-200"
              title="Đăng xuất"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between border-b border-slate-100 z-10">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-gray-600 hover:bg-gray-100/80">
                <Menu size={20} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-64 p-0 bg-[#0b0f19] border-r border-slate-900/60 flex flex-col h-full text-slate-200"
            >
              {/* Brand Header Mobile */}
              <div className="h-16 p-4 flex items-center justify-between border-b border-slate-900/60 bg-[#0b0f19]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#0f142e] border border-slate-800 rounded-xl flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <img src="/logo.svg" alt="LM Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-sm font-black text-slate-100 tracking-wider leading-none">LM Dashboard</h1>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[8px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">v2.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Mobile */}
              <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
                {menuGroups.map((group) => (
                  <div key={group.title} className="space-y-1.5">
                    <h3 className="px-3 text-[10px] font-bold text-slate-500/80 uppercase tracking-widest mb-2">
                      {group.title}
                    </h3>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item.path}>
                          <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-300 ease-in-out group transform
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white border-indigo-500/30 shadow-[0_4px_12px_rgba(99,102,241,0.25)] translate-x-1"
                                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border-transparent hover:translate-x-1"
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <item.icon
                                  size={16}
                                  className={`transition-colors duration-300 ${
                                    isActive
                                      ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]"
                                      : "text-slate-500 group-hover:text-indigo-400"
                                  }`}
                                />
                                <span>{item.name}</span>
                              </>
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>

              {/* R2 Storage Stats Mobile */}
              <div className="px-4 py-2 border-t border-slate-900/60 bg-[#0b0f19]">
                <R2StorageWidget />
              </div>

              {/* User Profile Mobile */}
              <div className="p-4 border-t border-slate-900/60 bg-[#0b0f19]">
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/50 border border-slate-800/40 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2.5 truncate">
                    <Avatar className="h-8 w-8 ring-1 ring-indigo-500/30">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[10px]">
                        {getInitials(username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="font-semibold text-xs text-slate-200 truncate leading-tight">
                        {username}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                        Quản trị viên
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all duration-200"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* User Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl cursor-pointer hover:bg-gray-100/80 active:scale-95 transition-all duration-200 focus:outline-none border border-transparent hover:border-gray-200/30">
                <Avatar className="h-8 w-8 shadow-sm border border-gray-200/40">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown size={12} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md p-1.5"
            >
              <div className="px-2.5 py-2 mb-1.5 bg-gray-50/50 rounded-xl">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Tài khoản
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(username)
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-xs text-gray-800 truncate">
                      {username}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="my-1 opacity-50" />

              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 transition-colors cursor-pointer"
              >
                <Settings size={14} className="text-gray-400" />
                <span>Cài đặt</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/formulas")}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 transition-colors cursor-pointer"
              >
                <Calculator size={14} className="text-gray-400" />
                <span>Công thức tính</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 opacity-50" />

              <DropdownMenuItem
                onClick={handleLogoutClick}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 transition-colors cursor-pointer"
              >
                <LogOut size={14} className="text-red-500" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content Area */}
        <main ref={mainRef} className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 min-h-full border border-gray-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
