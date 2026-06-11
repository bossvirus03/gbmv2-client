import React from "react";
import { useBatchesQuery } from "@/hooks/useBatches";
import { useCustomersQuery } from "@/hooks/useCustomers";
import { useExpensesQuery } from "@/hooks/useExpenses";
import { useOrderItemsQuery } from "@/hooks/useOrderItems";
import { BarChart3, Users, PackageCheck } from "lucide-react";
import { formatVND } from "@/lib/utils";


function StatisticPage() {
  // Fetch using custom hooks
  const { data: batches = [], isLoading: isLoadingBatches } = useBatchesQuery();
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomersQuery();
  const { data: expenses = [], isLoading: isLoadingExpenses } =
    useExpensesQuery();
  const { data: orderItems = [], isLoading: isLoadingOrderItems } =
    useOrderItemsQuery();

  if (
    isLoadingBatches ||
    isLoadingCustomers ||
    isLoadingExpenses ||
    isLoadingOrderItems
  ) {
    return (
      <div className="text-center py-12 text-gray-500">
        Đang phân tích số liệu hệ thống...
      </div>
    );
  }

  // Calculate product statuses
  let totalProducts = 0;
  let availableProducts = 0;
  let depositProducts = 0;
  let soldProducts = 0;

  batches.forEach((b) => {
    (b.products || []).forEach((p: any) => {
      totalProducts++;
      if (p.status === "SOLD") soldProducts++;
      else if (p.status === "DEPOSIT") depositProducts++;
      else availableProducts++;
    });
  });

  // Calculate money status
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

  // Maximum value for bar charts
  const maxFinanceVal = Math.max(
    totalRevenue,
    totalInvestment,
    totalExpenses,
    1,
  );
  const revenuePercent = (totalRevenue / maxFinanceVal) * 100;
  const investmentPercent = (totalInvestment / maxFinanceVal) * 100;
  const expensesPercent = (totalExpenses / maxFinanceVal) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Báo cáo Thống kê</h1>
        <p className="text-sm text-gray-500 mt-1">
          Phân tích chuyên sâu về hàng hóa, doanh số và vận hành hệ thống.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Products */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <PackageCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tổng số sản phẩm
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">
              {totalProducts} Món
            </h3>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tổng khách hàng
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">
              {customers.length} người
            </h3>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tổng giao dịch bán
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">
              {orderItems.length} lượt
            </h3>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchandise stats */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Tình trạng Hàng hóa
          </h3>

          <div className="space-y-5">
            {/* AVAILABLE */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700">
                  Sẵn sàng bán (Available)
                </span>
                <span className="font-bold text-gray-800">
                  {availableProducts} / {totalProducts} (
                  {totalProducts
                    ? Math.round((availableProducts / totalProducts) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{
                    width: `${totalProducts ? (availableProducts / totalProducts) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* DEPOSIT */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700">
                  Đã đặt cọc (Deposit)
                </span>
                <span className="font-bold text-gray-800">
                  {depositProducts} / {totalProducts} (
                  {totalProducts
                    ? Math.round((depositProducts / totalProducts) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{
                    width: `${totalProducts ? (depositProducts / totalProducts) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* SOLD */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700">
                  Đã bán hoàn tất (Sold)
                </span>
                <span className="font-bold text-gray-800">
                  {soldProducts} / {totalProducts} (
                  {totalProducts
                    ? Math.round((soldProducts / totalProducts) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{
                    width: `${totalProducts ? (soldProducts / totalProducts) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial compare */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            So sánh Dòng tiền
          </h3>

          <div className="flex h-56 items-end justify-around gap-6 pt-4 border-b border-gray-100 pb-2">
            {/* Revenue Bar */}
            <div className="flex flex-col items-center w-full group">
              <span className="text-xs font-bold text-green-600 mb-2 opacity-0 group-hover:opacity-100 transition duration-200">
                {formatVND(totalRevenue)}
              </span>
              <div
                className="w-12 bg-green-500 rounded-t-xl transition-all duration-500 hover:bg-green-600 cursor-pointer"
                style={{ height: `${revenuePercent}%`, minHeight: "10px" }}
              ></div>
              <span className="text-xs text-gray-500 mt-2 font-semibold">
                Thu nhập
              </span>
            </div>


            {/* Investment Bar */}
            <div className="flex flex-col items-center w-full group">
              <span className="text-xs font-bold text-blue-600 mb-2 opacity-0 group-hover:opacity-100 transition duration-200">
                {formatVND(totalInvestment)}
              </span>
              <div
                className="w-12 bg-blue-500 rounded-t-xl transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                style={{ height: `${investmentPercent}%`, minHeight: "10px" }}
              ></div>
              <span className="text-xs text-gray-500 mt-2 font-semibold">
                Vốn lô hàng
              </span>
            </div>


            {/* Expenses Bar */}
            <div className="flex flex-col items-center w-full group">
              <span className="text-xs font-bold text-rose-600 mb-2 opacity-0 group-hover:opacity-100 transition duration-200">
                {formatVND(totalExpenses)}
              </span>
              <div
                className="w-12 bg-rose-500 rounded-t-xl transition-all duration-500 hover:bg-rose-600 cursor-pointer"
                style={{ height: `${expensesPercent}%`, minHeight: "10px" }}
              ></div>
              <span className="text-xs text-gray-500 mt-2 font-semibold">
                Chi phí phụ
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticPage;
