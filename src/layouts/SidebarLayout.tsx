import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";
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

const menuItems = [
  { name: "Trang chủ", path: "/", icon: Home },
  { name: "Batch", path: "/batch", icon: Package },
  { name: "Khách hàng", path: "/customer", icon: Users },
  { name: "Người dùng", path: "/user", icon: UserCog },
  { name: "Quỹ tiền", path: "/fund", icon: DollarSign },
  { name: "Chi phí", path: "/expense", icon: Receipt },
  { name: "Thống kê", path: "/statistic", icon: BarChart3 },
  { name: "Cài đặt", path: "/settings", icon: Settings },
  { name: "Công thức tính", path: "/formulas", icon: Calculator },
];

const SidebarLayout = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Nguyễn Văn A");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
    <div className="flex h-screen bg-gray-100 border-r-0">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-72 flex-col bg-white shadow-md">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow">
            M
          </div>
          <h1 className="text-xl font-semibold text-gray-800">GBM</h1>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                 ${
                   isActive
                     ? "bg-blue-600 text-white shadow-sm"
                     : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
                 }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between shadow-sm">
          {/* Mobile Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu size={22} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-72 p-0 bg-white border-none "
            >
              <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow">
                  M
                </div>
                <h1 className="text-xl font-semibold text-gray-800">GBM</h1>
              </div>

              <nav className="p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all
                       ${
                         isActive
                           ? "bg-blue-600 text-white shadow-sm"
                           : "hover:bg-gray-100/70"
                       }`
                        }
                      >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1.5 px-3 rounded-2xl cursor-pointer hover:bg-gray-100/80 active:scale-[0.97] transition-all duration-200 focus:outline-none group text-left border border-transparent hover:border-gray-200/50">
                <Avatar className="h-9 w-9 shadow-inner border border-gray-200/50">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="font-semibold text-sm text-gray-800 leading-tight">
                    {username}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Quản trị viên
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className="text-gray-400 group-data-[state=open]:rotate-180 transition-transform duration-200 hidden sm:block"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 rounded-2xl shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md p-1.5"
            >
              <div className="px-3 py-2.5 mb-1.5 bg-gray-50/50 rounded-xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tài khoản
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden">
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
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {username}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      Hệ thống Quản lý
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="my-1 opacity-50" />

              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 transition-colors cursor-pointer"
              >
                <Settings size={16} className="text-gray-400" />
                <span>Cài đặt</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/formulas")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 transition-colors cursor-pointer"
              >
                <Calculator size={16} className="text-gray-400" />
                <span>Công thức tính</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 opacity-50" />

              <DropdownMenuItem
                onClick={handleLogoutClick}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 transition-colors cursor-pointer"
              >
                <LogOut size={16} className="text-red-500" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
