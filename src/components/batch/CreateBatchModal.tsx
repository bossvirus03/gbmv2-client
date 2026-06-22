import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateBatchMutation } from "@/hooks/useBatches";
import { formatNumberInput, parseNumberInput, formatVND } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
}

type EditBatchFields = {
  name: string;
  jpyAmount: string;
  exchangeRate: string;
  domesticShipJpy: string;
  shippingToVn: string;
  serviceFeeRate: number;
  url: string;
};

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const { toast } = useToast();
  const [tempWeight, setTempWeight] = useState("");

  const createForm = useForm<EditBatchFields>({
    defaultValues: {
      name: "",
      jpyAmount: "",
      exchangeRate: "",
      domesticShipJpy: "",
      shippingToVn: "",
      serviceFeeRate: 0,
      url: "",
    }
  });

  // Real-time calculations for money preview
  const jpyAmountVal = createForm.watch("jpyAmount") || "";
  const exchangeRateVal = createForm.watch("exchangeRate") || "";
  const domesticShipJpyVal = createForm.watch("domesticShipJpy") || "";
  const shippingToVnVal = createForm.watch("shippingToVn") || "";
  const serviceFeeRateVal = createForm.watch("serviceFeeRate") ?? 0;

  const numJpy = parseNumberInput(jpyAmountVal);
  const numRate = parseNumberInput(exchangeRateVal);
  const numDomestic = parseNumberInput(domesticShipJpyVal);
  const numShipVn = parseNumberInput(shippingToVnVal);
  const numFeeRate = Number(serviceFeeRateVal) || 0;

  const goodsCostVnd = numJpy * numRate;
  const domesticShipVnd = numDomestic * numRate;
  const serviceFeeVnd = (numJpy + numDomestic) * numRate * (numFeeRate / 100);
  const totalInvestmentVnd = goodsCostVnd + domesticShipVnd + numShipVn + serviceFeeVnd;

  const createBatchMutation = useCreateBatchMutation(() => {
    toast.success("Tạo lô hàng mới thành công!");
    onClose();
  });

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      createForm.reset({
        name: "",
        jpyAmount: "",
        exchangeRate: settings?.exchangeRate
          ? formatNumberInput(String(settings.exchangeRate))
          : "",
        domesticShipJpy: settings?.domesticShippingJpy
          ? formatNumberInput(String(settings.domesticShippingJpy))
          : "",
        shippingToVn: "",
        serviceFeeRate: settings?.serviceFeeRate
          ? Number(settings.serviceFeeRate)
          : 0,
        url: "",
      });
      setTempWeight("");
    }
  }, [isOpen]);

  // Autofill khi settings tải xong
  useEffect(() => {
    if (isOpen && settings) {
      if (!createForm.getValues("exchangeRate")) {
        createForm.setValue(
          "exchangeRate",
          formatNumberInput(String(settings.exchangeRate)),
        );
      }
      if (!createForm.getValues("domesticShipJpy")) {
        createForm.setValue(
          "domesticShipJpy",
          formatNumberInput(String(settings.domesticShippingJpy)),
        );
      }
      if (
        createForm.getValues("serviceFeeRate") === 0 ||
        !createForm.getValues("serviceFeeRate")
      ) {
        createForm.setValue("serviceFeeRate", Number(settings.serviceFeeRate));
      }
    }
  }, [settings, isOpen, createForm]);

  const onSubmitCreate = (data: EditBatchFields) => {
    const trimmedName = (data.name || "").trim();
    if (!trimmedName) {
      toast.error("Tên lô hàng không được để trống!");
      return;
    }

    const payload = {
      name: trimmedName,
      jpyAmount: parseNumberInput(data.jpyAmount),
      exchangeRate: parseNumberInput(data.exchangeRate),
      domesticShipJpy: parseNumberInput(data.domesticShipJpy),
      shippingToVn: parseNumberInput(data.shippingToVn),
      serviceFeeRate: Number(data.serviceFeeRate),
      url: data.url || undefined,
    } as any;

    console.log("[CreateBatchModal] Sending create request payload:", payload);

    createBatchMutation.mutate(payload, {
      onError: (err: any) => {
        console.error(err);
        toast.error(
          err?.response?.data?.message?.join("\n") || "Có lỗi khi tạo lô hàng",
        );
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg mx-4 p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Tạo lô hàng mới
        </h2>

        <form
          onSubmit={createForm.handleSubmit(onSubmitCreate)}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              Tên lô hàng *
            </label>
            <input
              type="text"
              placeholder="Nhập tên lô hàng"
              {...createForm.register("name", {
                required: "Vui lòng nhập tên lô hàng",
                validate: (value) => (value || "").trim() !== "" || "Tên lô hàng không được để trống hoặc chỉ chứa khoảng trắng",
              })}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {createForm.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1 ml-2">
                {createForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                Tổng JPY *
              </label>
              <input
                type="text"
                placeholder="0"
                {...createForm.register("jpyAmount", {
                  required: "Vui lòng nhập tổng JPY",
                  onChange: (e) => {
                    e.target.value = formatNumberInput(e.target.value);
                  },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {createForm.formState.errors.jpyAmount && (
                <p className="text-xs text-red-500 mt-1 ml-2">
                  {createForm.formState.errors.jpyAmount.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                Tỷ giá (VND) *
              </label>
              <input
                type="text"
                placeholder={
                  settings?.exchangeRate ? String(settings.exchangeRate) : "0"
                }
                {...createForm.register("exchangeRate", {
                  required: "Vui lòng nhập tỷ giá",
                  onChange: (e) => {
                    e.target.value = formatNumberInput(e.target.value);
                  },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {createForm.formState.errors.exchangeRate && (
                <p className="text-xs text-red-500 mt-1 ml-2">
                  {createForm.formState.errors.exchangeRate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                Phí ship Nhật (JPY)
              </label>
              <input
                type="text"
                placeholder={
                  settings?.domesticShippingJpy
                    ? String(settings.domesticShippingJpy)
                    : "0"
                }
                {...createForm.register("domesticShipJpy", {
                  onChange: (e) => {
                    e.target.value = formatNumberInput(e.target.value);
                  },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                    Ship về VN (VND)
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    {...createForm.register("shippingToVn", {
                      onChange: (e) => {
                        e.target.value = formatNumberInput(e.target.value);
                      },
                    })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-500 flex items-center gap-1 flex-wrap">
                    <span>Cân nặng (kg)</span>
                    {settings?.shippingVnPerKg && (
                      <span className="text-[10px] text-gray-400 lowercase font-normal">
                        ({formatVND(settings.shippingVnPerKg)}/kg)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Nhập số kg"
                    value={tempWeight}
                    onChange={(e) => {
                      setTempWeight(e.target.value);
                      const weight = parseFloat(e.target.value);
                      if (!isNaN(weight) && settings?.shippingVnPerKg) {
                        const calculatedCost =
                          weight * Number(settings.shippingVnPerKg);
                        createForm.setValue(
                          "shippingToVn",
                          formatNumberInput(calculatedCost),
                        );
                      } else if (e.target.value === "") {
                        createForm.setValue("shippingToVn", "");
                      }
                    }}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              Phí dịch vụ (%)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={
                settings?.serviceFeeRate ? String(settings.serviceFeeRate) : "0"
              }
              {...createForm.register("serviceFeeRate")}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              Link tham khảo (nếu có)
            </label>
            <input
              type="url"
              placeholder="https://..."
              {...createForm.register("url")}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Real-time investment preview */}
          {(numJpy > 0 || numDomestic > 0 || numShipVn > 0) && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-1">
                Xem trước chi phí đầu tư
              </h3>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tiền hàng ({formatNumberInput(String(numJpy))} ¥)</span>
                <span className="font-semibold">{formatVND(goodsCostVnd)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 border-t border-gray-100/50 pt-2">
                <span>Ship nội địa Nhật ({formatNumberInput(String(numDomestic))} ¥)</span>
                <span className="font-semibold">{formatVND(domesticShipVnd)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 border-t border-gray-100/50 pt-2">
                <span>Phí dịch vụ ({numFeeRate}%)</span>
                <span className="font-semibold text-indigo-600">{formatVND(serviceFeeVnd)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 border-t border-gray-100/50 pt-2">
                <span>Ship Nhật - Việt</span>
                <span className="font-semibold">{formatVND(numShipVn)}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 mt-1 flex flex-col items-center">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">TỔNG VỐN LÔ HÀNG</span>
                <span className="text-2xl font-black text-blue-600 mt-1">{formatVND(totalInvestmentVnd)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 cursor-pointer text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                createForm.formState.isSubmitting ||
                createBatchMutation.isPending
              }
              className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer text-sm"
            >
              {createForm.formState.isSubmitting ||
              createBatchMutation.isPending
                ? "Đang tạo..."
                : "Tạo lô hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
