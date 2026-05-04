import { Outlet, NavLink } from "react-router-dom";
import {
  Home,
  Package,
  Users,
  UserCog,
  DollarSign,
  Receipt,
  BarChart3,
  Menu,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Button } from "../components/ui/button";

const menuItems = [
  { name: "Trang chủ", path: "/", icon: Home },
  { name: "Batch", path: "/batch", icon: Package },
  { name: "Khách hàng", path: "/customer", icon: Users },
  { name: "Người dùng", path: "/user", icon: UserCog },
  { name: "Quỹ tiền", path: "/fund", icon: DollarSign },
  { name: "Chi phí", path: "/expense", icon: Receipt },
  { name: "Thống kê", path: "/statistic", icon: BarChart3 },
];

const SidebarLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 border-r-0">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-72 flex-col bg-white shadow-md">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow">
            M
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Manager</h1>
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

            <SheetContent side="left" className="w-72 p-0 bg-white border-none ">
              <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow">
                  M
                </div>
                <h1 className="text-xl font-semibold text-gray-800">Manager</h1>
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
              <div className="flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition">
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-sm">Nguyễn Văn A</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <Avatar className="shadow-sm">
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl shadow-lg"
            >
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Thông tin cá nhân</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
