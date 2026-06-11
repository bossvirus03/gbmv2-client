import React, { useState, useEffect } from "react";
import { useSettingsQuery } from "@/hooks/useSettings";
import { formatVND, formatNumberInput, parseNumberInput } from "@/lib/utils";
import {
  Calculator,
  Coins,
  TrendingUp,
  Truck,
  Percent,
  Layers,
  Info,
  DollarSign,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";

function FormulaPage() {
  const { data: settings, isLoading } = useSettingsQuery();

  // State cho trình giả lập (Simulator)
  const [jpyAmount, setJpyAmount] = useState("10.000");
  const [domesticShipJpy, setDomesticShipJpy] = useState("910");
  const [exchangeRate, setExchangeRate] = useState("");
  const [weight, setWeight] = useState("2.5");
  const [shippingVnPerKg, setShippingVnPerKg] = useState("");
  const [serviceFeeRate, setServiceFeeRate] = useState("5"); // mặc định 5%

  // Đồng bộ cài đặt từ DB vào Simulator khi tải xong
  useEffect(() => {
    if (settings) {
      if (settings.exchangeRate && !exchangeRate) {
        setExchangeRate(formatNumberInput(String(settings.exchangeRate)));
      }
      if (settings.shippingVnPerKg && !shippingVnPerKg) {
        setShippingVnPerKg(formatNumberInput(String(settings.shippingVnPerKg)));
      }
      if (settings.domesticShippingJpy && !domesticShipJpy) {
        setDomesticShipJpy(
          formatNumberInput(String(settings.domesticShippingJpy)),
        );
      }
      if (settings.serviceFeeRate && !serviceFeeRate) {
        setServiceFeeRate(String(settings.serviceFeeRate));
      }
    }
  }, [settings]);

  // Reset simulator về cấu hình mặc định
  const handleReset = () => {
    if (settings) {
      setJpyAmount("10.000");
      setDomesticShipJpy(
        formatNumberInput(String(settings.domesticShippingJpy)),
      );
      setExchangeRate(formatNumberInput(String(settings.exchangeRate)));
      setWeight("2.5");
      setShippingVnPerKg(formatNumberInput(String(settings.shippingVnPerKg)));
      setServiceFeeRate(String(settings.serviceFeeRate || "5"));
    } else {
      setJpyAmount("10.000");
      setDomesticShipJpy("800");
      setExchangeRate("160");
      setWeight("2.5");
      setShippingVnPerKg("230.000");
      setServiceFeeRate("5");
    }
  };

  // Các giá trị đã được parse để tính toán
  const numJpy = parseNumberInput(jpyAmount);
  const numDomestic = parseNumberInput(domesticShipJpy);
  const numRate = parseNumberInput(exchangeRate);
  const numWeight = Number(weight) || 0;
  const numShipVn = parseNumberInput(shippingVnPerKg);
  const numFeeRate = Number(serviceFeeRate) || 0;

  // Tính toán kết quả mô phỏng
  const goodsCostVnd = numJpy * numRate;
  const domesticShipVnd = numDomestic * numRate;
  const vnShipCostVnd = numWeight * numShipVn;
  const serviceFeeVnd = (numJpy + numDomestic) * numRate * (numFeeRate / 100);
  const totalInvestmentVnd = goodsCostVnd + domesticShipVnd + vnShipCostVnd + serviceFeeVnd;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator size={28} className="text-blue-600" />
          Công thức tính tiền
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Giải thích chi tiết phương thức tính toán chi phí, doanh thu, lợi
          nhuận và bộ giả lập dòng tiền của hệ thống.
        </p>
      </div>

      {/* 1. Giải thích công thức */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thẻ 1: Vốn Lô Hàng */}
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/20 border border-blue-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
              <Layers size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              1. Vốn đầu tư lô hàng
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              BATCH INVESTMENT COST
            </p>
            <div className="my-4 p-3.5 bg-white border border-blue-100 rounded-2xl space-y-1">
              <code className="text-xs font-bold text-blue-700 block text-center leading-relaxed">
                Vốn Lô = (Hàng JPY + Ship Nhật JPY) * Tỷ giá + Ship VN + Phí Công mua (VND)
              </code>
              <code className="text-[10px] font-semibold text-indigo-600 block text-center leading-relaxed">
                Trong đó: Phí Công mua = (Hàng JPY + Ship Nhật JPY) * Tỷ giá * % Công mua
              </code>
            </div>
            <ul className="text-xs text-gray-600 space-y-2 mt-2">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Hàng JPY:</strong> Tổng tiền hàng mua tại Nhật.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Ship Nhật JPY:</strong> Phí vận chuyển nội địa tại Nhật.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Tỷ giá Yên:</strong> Giá quy đổi 1 JPY sang VND.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Ship VN:</strong> Tiền vận chuyển Nhật - Việt, tính bằng{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">
                    Cân nặng (kg) * Đơn giá/kg
                  </code>.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Phí Công mua:</strong> Phí dịch vụ mua hàng, tính theo công thức:{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">
                    (Tiền hàng + Ship Nhật) * Tỷ giá * % Công mua
                  </code>.
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-50 text-[11px] text-blue-500 flex items-center gap-1">
            <Info size={12} />
            <span>Mặc định nạp khi tạo mới tại trang Lô hàng.</span>
          </div>
        </div>

        {/* Thẻ 2: Doanh Thu */}
        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/20 border border-green-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-green-500/20">
              <DollarSign size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              2. Doanh thu thực tế
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              ACTUAL REVENUE
            </p>
            <div className="my-4 p-3.5 bg-white border border-green-100 rounded-2xl">
              <code className="text-xs font-bold text-green-700 block text-center leading-relaxed">
                Doanh Thu = Tiền Bán (Completed) + Tiền Cọc (Deposit)
              </code>
            </div>
            <ul className="text-xs text-gray-600 space-y-2 mt-2">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Completed:</strong> Đơn hàng đã bán thành công, thu về
                  100% giá bán sản phẩm.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Deposit:</strong> Đơn hàng đang được đặt cọc, ghi nhận
                  số tiền cọc thực nhận.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Đang bán (Available):</strong> Chưa bán, chưa phát
                  sinh dòng thu.
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-green-50 text-[11px] text-green-600 flex items-center gap-1">
            <Info size={12} />
            <span>Được đồng bộ trực tiếp từ các đơn hàng.</span>
          </div>
        </div>

        {/* Thẻ 3: Lợi Nhuận Ròng */}
        <div className="bg-gradient-to-br from-purple-50/50 to-fuchsia-50/20 border border-purple-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-purple-500/20">
              <TrendingUp size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              3. Lợi nhuận ròng
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              NET PROFIT
            </p>
            <div className="my-4 p-3.5 bg-white border border-purple-100 rounded-2xl">
              <code className="text-xs font-bold text-purple-700 block text-center leading-relaxed">
                Lợi Nhuận = Doanh Thu - Vốn Lô - Chi Phí Phụ
              </code>
            </div>
            <ul className="text-xs text-gray-600 space-y-2 mt-2">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Vốn Lô:</strong> Vốn gốc của lô hàng tính theo VND ở
                  trên (đã bao gồm phí công mua).
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Chi Phí Phụ:</strong> Các khoản chi tiêu phát sinh
                  ngoài lề (như quảng cáo, bao bì, quà tặng...) được ghi nhận
                  tại trang Chi phí.
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-50 text-[11px] text-purple-600 flex items-center gap-1">
            <Info size={12} />
            <span>Phân tích biểu đồ dòng tiền tại trang Thống kê.</span>
          </div>
        </div>
      </div>

      {/* 2. Trình giả lập tính toán (Simulator) */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Play size={20} className="text-blue-600" />
              Bộ giả lập tính toán vốn lô hàng
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Nhập thử các thông số mô phỏng để hệ thống tự động xuất bảng chi
              phí dự tính.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-xl transition active:scale-[0.98] self-start sm:self-center"
          >
            <RotateCcw size={14} />
            Reset mặc định
          </button>
        </div>

        {/* Bố cục Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Form nhập liệu */}
          <div className="lg:col-span-7 space-y-5">
            <h4 className="text-sm font-bold text-gray-700 border-l-4 border-blue-500 pl-2">
              Thông số đầu vào
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tiền hàng JPY */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Coins size={14} className="text-gray-400" />
                  Tiền hàng (JPY)
                </label>
                <input
                  type="text"
                  value={jpyAmount}
                  onChange={(e) =>
                    setJpyAmount(formatNumberInput(e.target.value))
                  }
                  placeholder="Nhập số tiền hàng JPY"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Ship Nhật JPY */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Coins size={14} className="text-gray-400 animate-pulse" />
                  Ship nội địa Nhật (JPY)
                </label>
                <input
                  type="text"
                  value={domesticShipJpy}
                  onChange={(e) =>
                    setDomesticShipJpy(formatNumberInput(e.target.value))
                  }
                  placeholder="Nhập phí ship Nhật JPY"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Tỷ giá Yên */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={14} className="text-gray-400" />
                  Tỷ giá Yên (VND)
                </label>
                <input
                  type="text"
                  value={exchangeRate}
                  onChange={(e) =>
                    setExchangeRate(formatNumberInput(e.target.value))
                  }
                  placeholder="Tỷ giá quy đổi VND"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* % Công mua */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Percent size={14} className="text-gray-400" />
                  % Công mua
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={serviceFeeRate}
                  onChange={(e) => setServiceFeeRate(e.target.value)}
                  placeholder="Nhập % công mua"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Cân nặng kg */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Truck size={14} className="text-gray-400" />
                  Cân nặng (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Nhập cân nặng kg"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Ship VN/kg */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Truck size={14} className="text-gray-400" />
                  Ship về Việt Nam (VND/kg)
                </label>
                <input
                  type="text"
                  value={shippingVnPerKg}
                  onChange={(e) =>
                    setShippingVnPerKg(formatNumberInput(e.target.value))
                  }
                  placeholder="Nhập đơn giá ship về VN theo cân"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Chú ý */}
            <div className="bg-gray-50 border border-gray-200/50 rounded-2xl p-4 flex gap-3">
              <HelpCircle className="text-gray-400 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-gray-700">
                  Lưu ý về Cấu hình mặc định
                </h5>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Các thông số Tỷ giá Yên, Ship nội địa Nhật, Công mua và Ship về Việt Nam
                  được tự động tải từ cài đặt hệ thống của bạn để mô phỏng chính
                  xác nhất. Bạn có thể sửa đổi cấu hình mặc định này tại trang{" "}
                  <strong>Cài đặt</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: Báo cáo kết quả */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            {/* Phông nền trang trí */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-4 relative">
              <h4 className="text-sm font-bold text-slate-700 border-l-4 border-slate-600 pl-2 uppercase tracking-wide">
                Bảng phân tích chi phí
              </h4>

              {/* Chi tiết từng phần */}
              <div className="space-y-3 pt-2 text-xs">
                {/* 1. Tiền hàng quy đổi */}
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">
                    Tiền hàng ({jpyAmount || 0} JPY)
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatVND(goodsCostVnd)}
                  </span>
                </div>

                {/* 2. Tiền ship Nhật */}
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">
                    Ship nội địa Nhật ({domesticShipJpy || 0} JPY)
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatVND(domesticShipVnd)}
                  </span>
                </div>

                {/* 3. Phí công mua */}
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-slate-500">Phí công mua</span>
                    <span className="text-[10px] text-slate-400">
                      ({serviceFeeRate || 0}%)
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 font-medium text-indigo-600">
                    {formatVND(serviceFeeVnd)}
                  </span>
                </div>

                {/* 4. Tiền ship VN */}
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-slate-500">Ship Nhật - Việt</span>
                    <span className="text-[10px] text-slate-400">
                      ({weight || 0} kg × {shippingVnPerKg || 0}đ)
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {formatVND(vnShipCostVnd)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tổng Vốn lô hàng */}
            <div className="mt-8 pt-6 border-t border-slate-200 relative">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                TỔNG CHI PHÍ ĐẦU TƯ DỰ TÍNH (VỐN LÔ)
              </p>
              <h3 className="text-3xl font-extrabold text-blue-600 text-center mt-2 tracking-tight">
                {formatVND(totalInvestmentVnd)}
              </h3>

              <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-700">
                <span className="font-medium">Tỷ giá Yên áp dụng:</span>
                <span className="font-bold">
                  1 JPY = {exchangeRate || 0} VND
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormulaPage;
