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

  const createForm = useForm<EditBatchFields>();

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
  }, [isOpen, settings]);

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
    const payload = {
      name: data.name,
      jpyAmount: parseNumberInput(data.jpyAmount),
      exchangeRate: parseNumberInput(data.exchangeRate),
      domesticShipJpy: parseNumberInput(data.domesticShipJpy),
      shippingToVn: parseNumberInput(data.shippingToVn),
      serviceFeeRate: Number(data.serviceFeeRate),
      url: data.url || undefined,
    } as any;

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
