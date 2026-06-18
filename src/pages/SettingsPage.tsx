import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from "@/hooks/useSettings";
import { formatNumberInput, parseNumberInput } from "@/lib/utils";
import {
  Settings,
  Coins,
  TrendingUp,
  Truck,
  Percent,
  Save,
  Loader2,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

type SettingsFormFields = {
  shippingVnPerKg: string;
  exchangeRate: string;
  domesticShippingJpy: string;
  serviceFeeRate: number;
};

function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation(() => {
    toast.success("Cấu hình hệ thống đã được cập nhật thành công!");
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SettingsFormFields>();

  // Reset form when settings query loads data
  useEffect(() => {
    if (settings) {
      reset({
        shippingVnPerKg: formatNumberInput(String(settings.shippingVnPerKg)),
        exchangeRate: formatNumberInput(String(settings.exchangeRate)),
        domesticShippingJpy: formatNumberInput(
          String(settings.domesticShippingJpy),
        ),
        serviceFeeRate: Number(settings.serviceFeeRate),
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormFields) => {
    const payload = {
      shippingVnPerKg: parseNumberInput(data.shippingVnPerKg),
      exchangeRate: parseNumberInput(data.exchangeRate),
      domesticShippingJpy: parseNumberInput(data.domesticShippingJpy),
      serviceFeeRate: Number(data.serviceFeeRate),
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500 font-medium">
        Đang tải cấu hình hệ thống...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Settings size={28} className="text-gray-600 animate-spin-slow" />
          Cài đặt hệ thống
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Thiết lập các thông số mặc định của cửa hàng để tự động điền khi tạo
          lô hàng mới.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tỷ giá Yên */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-gray-400" />
                Tỷ giá Yên (VND) *
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 160"
                {...register("exchangeRate", {
                  required: "Vui lòng nhập tỷ giá Yên mặc định",
                  onChange: (e) => {
                    e.target.value = formatNumberInput(e.target.value);
                  },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-gray-50/50 focus:bg-white transition"
              />
              {errors.exchangeRate && (
                <p className="text-xs text-red-500 font-medium mt-1 ml-1">
                  {errors.exchangeRate.message}
                </p>
              )}
            </div>

            {/* Ship nội địa Nhật */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins size={14} className="text-gray-400" />
                Ship nội địa Nhật (JPY) *
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 910"
                {...register("domesticShippingJpy", {
                  required: "Vui lòng nhập phí ship Nhật mặc định",
                  onChange: (e) => {
                    e.target.value = formatNumberInput(e.target.value);
                  },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-gray-50/50 focus:bg-white transition"
              />
              {errors.domesticShippingJpy && (
                <p className="text-xs text-red-500 font-medium mt-1 ml-1">
                  {errors.domesticShippingJpy.message}
                </p>
              )}
            </div>

            {/* Phí ship VN theo kg */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={14} className="text-gray-400" />
                Ship về VN theo cân (VND/kg) *
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 230.000"
                {...register("shippingVnPerKg", {
                  required: "Vui lòng nhập phí vận chuyển về VN",
                  onChange: (e) => {
                    e.target.value = formatNumberInput(e.target.value);
                  },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-gray-50/50 focus:bg-white transition"
              />
              {errors.shippingVnPerKg && (
                <p className="text-xs text-red-500 font-medium mt-1 ml-1">
                  {errors.shippingVnPerKg.message}
                </p>
              )}
            </div>

            {/* % công mua */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Percent size={14} className="text-gray-400" />% công mua mặc
                định *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ví dụ: 2"
                {...register("serviceFeeRate", {
                  required: "Vui lòng nhập phần trăm công mua",
                  min: { value: 0, message: "Phí dịch vụ không được âm" },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-gray-50/50 focus:bg-white transition"
              />
              {errors.serviceFeeRate && (
                <p className="text-xs text-red-500 font-medium mt-1 ml-1">
                  {errors.serviceFeeRate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg transition active:scale-[0.98] cursor-pointer text-sm disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang lưu cấu hình...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu cài đặt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
