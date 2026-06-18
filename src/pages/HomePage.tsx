import { useEffect, useState } from "react";
import { useBatchesQuery } from "@/hooks/useBatches";
import { useCustomersQuery } from "@/hooks/useCustomers";
import { useExpensesQuery } from "@/hooks/useExpenses";
import { useOrderItemsQuery } from "@/hooks/useOrderItems";
import { getAccessToken } from "@/lib/asyncLocalstoragate";
import {
  ArrowRight,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatVND } from "@/lib/utils";

function HomePage() {
  const [username, setUsername] = useState("Nguyễn Văn A");

  // Decode user info
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
        if (payload && payload.username) {
          setUsername(payload.username);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch metrics using custom hooks
  const { data: batches = [] } = useBatchesQuery();
  const { data: customers = [] } = useCustomersQuery();
  const { data: expenses = [] } = useExpensesQuery();
  const { data: orderItems = [] } = useOrderItemsQuery();

  // Compute total sold items
  let totalSold = 0;
  batches.forEach((b) => {
    (b.products || []).forEach((p: any) => {
      if (p.status === "SOLD") totalSold++;
    });
  });

  // Calculate finance balance
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0,
  );
  const totalInvestment = batches.reduce((sum, batch) => {
    const jpy = Number(batch.jpyAmount || 0);
    const rate = Number(batch.exchangeRate || 0);
    const domesticShip = Number(batch.domesticShipJpy || 0);
    const shippingVn = Number(batch.shippingToVn || 0);
    const serviceFeeRate = Number(batch.serviceFeeRate || 0);
    const serviceFee = (jpy + domesticShip) * rate * (serviceFeeRate / 100);
    return sum + jpy * rate + domesticShip * rate + shippingVn + serviceFee;
  }, 0);
  const totalRevenue = orderItems.reduce((sum, item: any) => {
    const status = item.order?.status;
    const price = Number(item.price || 0);
    const deposit = Number(item.deposit || 0);
    if (status === "COMPLETED") return sum + price;
    if (status === "DEPOSIT") return sum + deposit;
    return sum;
  }, 0);
  const fundBalance = totalRevenue - totalInvestment - totalExpenses;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 opacity-10 animate-pulse">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md">
            Hệ thống quản lý GBM
          </span>
          <h2 className="text-3xl font-extrabold mt-4">
            Chào mừng trở lại, {username}!
          </h2>
          <p className="text-blue-100/90 mt-2 text-sm leading-relaxed">
            Hôm nay là một ngày tuyệt vời để theo dõi hiệu suất bán hàng của
            bạn. Dữ liệu bên dưới đã được cập nhật trực tuyến từ máy chủ.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tổng Lô hàng
            </p>
            <h3 className="text-2xl font-bold text-gray-800">
              {batches.length} Lô
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tổng Khách hàng
            </p>
            <h3 className="text-2xl font-bold text-gray-800">
              {customers.length} Người
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Doanh thu thu về
            </p>
            <h3 className="text-2xl font-bold text-green-600">
              +{formatVND(totalRevenue)}
            </h3>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Số dư Quỹ hiện tại
            </p>
            <h3
              className={`text-2xl font-bold ${fundBalance >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatVND(fundBalance)}
            </h3>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${fundBalance >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            <BarChart3 size={24} />
          </div>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Lối tắt thao tác nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/create-order"
            className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:border-red-200 hover:bg-red-50/10 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <PlusCircle size={20} />
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                Tạo đơn hàng mới
              </span>
            </div>
            <ArrowRight
              size={18}
              className="text-gray-400 group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            to="/batch"
            className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:border-blue-200 hover:bg-blue-50/10 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={20} />
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                Danh sách lô hàng
              </span>
            </div>
            <ArrowRight
              size={18}
              className="text-gray-400 group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            to="/customer"
            className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/10 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                Quản lý Khách hàng
              </span>
            </div>
            <ArrowRight
              size={18}
              className="text-gray-400 group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            to="/fund"
            className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:border-green-200 hover:bg-green-50/10 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                Sổ quỹ tài chính
              </span>
            </div>
            <ArrowRight
              size={18}
              className="text-gray-400 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
