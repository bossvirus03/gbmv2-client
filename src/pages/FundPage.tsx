import { useState } from "react";
import { useBatchesQuery } from "@/hooks/useBatches";
import { useExpensesQuery } from "@/hooks/useExpenses";
import { useOrderItemsQuery } from "@/hooks/useOrderItems";
import {
  useCapitalsQuery,
  useCreateCapitalMutation,
  useDeleteCapitalMutation,
} from "@/hooks/useCapitals";
import { formatVND, formatNumberInput, parseNumberInput } from "@/lib/utils";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Landmark,
  Trash2,
  Plus,
} from "lucide-react";

type LedgerItem = {
  id: string;
  type: "REVENUE" | "INVESTMENT" | "EXPENSE";
  title: string;
  amount: number;
  date: string;
  detail: string;
};

function FundPage() {
  const [isEditInitialFund, setIsEditInitialFund] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newContent, setNewContent] = useState("Nạp quỹ");
  const [newDate, setNewDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  // Fetch data using custom hooks
  const { data: batches = [], isLoading: isLoadingBatches } = useBatchesQuery();
  const { data: expenses = [], isLoading: isLoadingExpenses } =
    useExpensesQuery();
  const { data: orderItems = [], isLoading: isLoadingOrderItems } =
    useOrderItemsQuery();

  // Fetch capitals data from DB
  const { data: capitals = [], isLoading: isLoadingCapitals } =
    useCapitalsQuery();
  const createCapitalMutation = useCreateCapitalMutation();
  const deleteCapitalMutation = useDeleteCapitalMutation();

  const initialFund = capitals.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0,
  );

  if (
    isLoadingBatches ||
    isLoadingExpenses ||
    isLoadingOrderItems ||
    isLoadingCapitals
  ) {
    return (
      <div className="text-center py-12 text-gray-500">
        Đang tổng hợp số liệu quỹ tiền...
      </div>
    );
  }

  // 1. Calculate Total Investment (Batch Cost)
  const totalInvestment = batches.reduce((sum, batch) => {
    const jpy = Number(batch.jpyAmount || 0);
    const rate = Number(batch.exchangeRate || 0);
    const domesticShip = Number(batch.domesticShipJpy || 0);
    const shippingVn = Number(batch.shippingToVn || 0);
    const serviceFeeRate = Number(batch.serviceFeeRate || 0);
    const serviceFee = (jpy + domesticShip) * rate * (serviceFeeRate / 100);

    const cost = jpy * rate + domesticShip * rate + shippingVn + serviceFee;
    return sum + cost;
  }, 0);

  // 2. Calculate Total Operating Expenses
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0,
  );

  // 3. Calculate Total Cash Received (Revenue)
  const totalRevenue = orderItems.reduce((sum, item: any) => {
    const status = item.order?.status;
    const price = Number(item.price || 0);
    const deposit = Number(item.deposit || 0);

    if (status === "COMPLETED") {
      return sum + price;
    } else if (status === "DEPOSIT") {
      return sum + deposit;
    }
    return sum;
  }, 0);

  // 4. Calculate Current Fund Balance (including initial fund)
  const fundBalance =
    initialFund + totalRevenue - totalInvestment - totalExpenses;

  // 5. Build Ledger (Transaction Log)
  const ledger: LedgerItem[] = [];

  // Add revenue items
  orderItems.forEach((item: any) => {
    const status = item.order?.status;
    if (status === "CANCELLED") return;

    const price = Number(item.price || 0);
    const deposit = Number(item.deposit || 0);
    const amount = status === "COMPLETED" ? price : deposit;

    ledger.push({
      id: `rev-${item.id}`,
      type: "REVENUE",
      title: `Bán sản phẩm #${item.productId}`,
      amount,
      date: item.order?.createdAt || new Date().toISOString(),
      detail:
        status === "COMPLETED"
          ? "Khách hàng thanh toán hoàn tất"
          : "Khách hàng đặt cọc",
    });
  });

  // Add expense items
  expenses.forEach((e) => {
    ledger.push({
      id: `exp-${e.id}`,
      type: "EXPENSE",
      title: e.content,
      amount: Number(e.amount),
      date: e.date,
      detail: "Chi phí phát sinh / vận hành",
    });
  });

  // Add batch investment items
  batches.forEach((batch) => {
    const jpy = Number(batch.jpyAmount || 0);
    const rate = Number(batch.exchangeRate || 0);
    const domesticShip = Number(batch.domesticShipJpy || 0);
    const shippingVn = Number(batch.shippingToVn || 0);
    const serviceFeeRate = Number(batch.serviceFeeRate || 0);
    const serviceFee = (jpy + domesticShip) * rate * (serviceFeeRate / 100);
    const cost = jpy * rate + domesticShip * rate + shippingVn + serviceFee;

    ledger.push({
      id: `inv-${batch.id}`,
      type: "INVESTMENT",
      title: `Thanh toán lô hàng: ${batch.name}`,
      amount: cost,
      date: new Date(2026, 0, batch.id).toISOString(),
      detail: `Giá gốc: ${jpy.toLocaleString()}¥ + Ship Nhật: ${domesticShip.toLocaleString()}¥ + Ship VN: ${formatVND(shippingVn)} + Phí công mua: ${formatVND(serviceFee)} (${serviceFeeRate}%)`,
    });
  });

  // Thêm các khoản vốn góp vào sổ cái
  capitals.forEach((c) => {
    ledger.push({
      id: `capital-${c.id}`,
      type: "REVENUE",
      title: c.content || "Nạp quỹ",
      amount: Number(c.amount),
      date: c.date,
      detail: "Tiền nạp quỹ",
    });
  });

  // Sort ledger by date descending
  const sortedLedger = [...ledger].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Báo cáo Quỹ tiền & Dòng tiền
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng quan tình hình tài chính của hệ thống, tự động tính toán dựa trên
          hóa đơn và chi phí.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Balance */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Số dư Quỹ hiện tại
            </p>
            <h3
              className={`text-2xl font-bold ${fundBalance >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatVND(fundBalance)}
            </h3>
            <p className="text-[11px] text-gray-500 flex items-center flex-wrap gap-1">
              <span>Tổng vốn góp:</span>
              <span className="font-bold text-gray-700">
                {formatVND(initialFund)}
              </span>

              <button
                onClick={() => {
                  setIsEditInitialFund(true);
                }}
                className="text-blue-600 hover:underline cursor-pointer font-bold text-[9px] uppercase tracking-wider ml-1"
              >
                [Chi tiết]
              </button>
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${fundBalance >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            <Wallet size={24} />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tổng Thu thực tế (In)
            </p>
            <h3 className="text-2xl font-bold text-green-600">
              +{formatVND(totalRevenue)}
            </h3>

            <p className="text-[11px] text-gray-500">
              Từ cọc & thanh toán đơn hàng
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Investment */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tiền mua Lô hàng
            </p>
            <h3 className="text-2xl font-bold text-red-500">
              -{formatVND(totalInvestment)}
            </h3>

            <p className="text-[11px] text-gray-500">
              Giá trị các lô hàng nhập về
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <Landmark size={24} />
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Chi phí vận hành (Out)
            </p>
            <h3 className="text-2xl font-bold text-rose-600">
              -{formatVND(totalExpenses)}
            </h3>

            <p className="text-[11px] text-gray-500">
              Các khoản chi phí vận hành khác
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* Transaction Log Ledger */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Nhật ký biến động quỹ (Sổ Món)
        </h3>

        <div className="space-y-4">
          {sortedLedger.map((item) => {
            const isRevenue = item.type === "REVENUE";
            const isInvestment = item.type === "INVESTMENT";

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isRevenue
                        ? "bg-green-50 text-green-600"
                        : isInvestment
                          ? "bg-blue-50 text-blue-600"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {isRevenue ? (
                      <ArrowUpRight size={20} />
                    ) : (
                      <ArrowDownRight size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-bold text-sm ${isRevenue ? "text-green-600" : "text-red-600"}`}
                  >
                    {isRevenue ? "+" : "-"}
                    {formatVND(item.amount)}
                  </span>

                  <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                    <Calendar size={10} />
                    {new Date(item.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal quản lý vốn góp */}
      {isEditInitialFund && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden flex flex-col p-6 space-y-4 max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Quản lý quỹ</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Danh sách chi tiết các lần góp vào quỹ cửa hàng.
                </p>
              </div>
              <button
                onClick={() => setIsEditInitialFund(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[30vh] pr-1">
              {capitals.length === 0 ? (
                <p className="text-center py-6 text-xs text-gray-400 italic">
                  Chưa có khoản góp nào được ghi nhận.
                </p>
              ) : (
                capitals.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100/50 transition animate-fade-in"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-700 truncate">
                        {c.content}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {new Date(c.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-green-600">
                        +{formatVND(c.amount)}
                      </span>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Bạn có chắc chắn muốn xóa khoản vốn góp này không?",
                            )
                          ) {
                            deleteCapitalMutation.mutate(c.id);
                          }
                        }}
                        disabled={deleteCapitalMutation.isPending}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Form thêm vốn góp mới */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Thêm khoản vốn góp mới
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="text"
                    value={newAmount}
                    onChange={(e) =>
                      setNewAmount(formatNumberInput(e.target.value))
                    }
                    placeholder="Ví dụ: 5.000.000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-gray-50/50 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Ngày góp
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-gray-50/50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Nội dung / Ghi chú
                </label>
                <input
                  type="text"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Ví dụ: Nạp quỹ tháng 4/2026"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-gray-50/50 focus:bg-white transition"
                />
              </div>

              <button
                type="button"
                disabled={createCapitalMutation.isPending || !newAmount}
                onClick={() => {
                  const amt = parseNumberInput(newAmount);
                  if (amt <= 0) return;
                  createCapitalMutation.mutate(
                    { amount: amt, content: newContent, date: newDate },

                    {
                      onSuccess: () => {
                        setNewAmount("");
                        setNewContent("Nạp quỹ");
                        setNewDate(new Date().toISOString().split("T")[0]);
                      },
                    },
                  );
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {createCapitalMutation.isPending ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Plus size={14} /> Nạp
                  </>
                )}
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsEditInitialFund(false)}
                className="w-full py-2.5 border border-gray-200 font-bold rounded-xl text-gray-500 hover:bg-gray-50 transition text-xs uppercase tracking-wider cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FundPage;
