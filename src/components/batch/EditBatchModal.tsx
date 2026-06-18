import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateBatchMutation } from "@/hooks/useBatches";
import { formatNumberInput, parseNumberInput, formatVND } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";
import { Batch } from "@/services/batchService";

interface EditBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
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

export const EditBatchModal: React.FC<EditBatchModalProps> = ({
  isOpen,
  onClose,
  batch,
  settings,
}) => {
  const { toast } = useToast();
  const [tempWeightEdit, setTempWeightEdit] = useState("");

  const editForm = useForm<EditBatchFields>();

  const updateBatchMutation = useUpdateBatchMutation(() => {
    toast.success("Cập nhật thông tin lô thành công!");
    onClose();
  });

  // Đồng bộ data khi mở modal sửa
  useEffect(() => {
    if (isOpen && batch) {
      editForm.reset({
        name: batch.name,
        jpyAmount: formatNumberInput(String(batch.jpyAmount)),
        exchangeRate: formatNumberInput(String(batch.exchangeRate)),
        domesticShipJpy: formatNumberInput(String(batch.domesticShipJpy)),
        shippingToVn: formatNumberInput(String(batch.shippingToVn)),
        serviceFeeRate: Number(batch.serviceFeeRate),
        url: batch.url || "",
      });
      setTempWeightEdit("");
    }
  }, [isOpen, batch]);

  const onSubmitEdit = (data: EditBatchFields) => {
    if (!batch) return;
    const payload = {
      name: data.name,
      jpyAmount: parseNumberInput(data.jpyAmount),
      exchangeRate: parseNumberInput(data.exchangeRate),
      domesticShipJpy: parseNumberInput(data.domesticShipJpy),
      shippingToVn: parseNumberInput(data.shippingToVn),
      serviceFeeRate: Number(data.serviceFeeRate),
      url: data.url || undefined,
    } as any;

    updateBatchMutation.mutate(
      { id: batch.id, data: payload },
      {
        onError: (err: any) => {
          console.error(err);
          toast.error(
            err?.response?.data?.message?.join("\n") || "Có lỗi khi cập nhật",
          );
        },
      },
    );
  };

  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg mx-4 p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Sửa thông tin lô hàng
        </h2>

        <form
          onSubmit={editForm.handleSubmit(onSubmitEdit)}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              Tên lô hàng *
            </label>
            <input
              type="text"
              {...editForm.register("name", {
                required: "Vui lòng nhập tên lô hàng",
              })}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {editForm.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1 ml-2">
                {editForm.formState.errors.name.message}
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
                {...editForm.register("jpyAmount", {
                  required: "Vui lòng nhập tổng JPY",
                  onChange: (e) => {
                    e.target.value = formatNumberInput(e.target.value);
                  },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {editForm.formState.errors.jpyAmount && (
                <p className="text-xs text-red-500 mt-1 ml-2">
                  {editForm.formState.errors.jpyAmount.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                Tỷ giá (VND) *
              </label>
              <input
                type="text"
                {...editForm.register("exchangeRate", {
                  required: "Vui lòng nhập tỷ giá",
                  onChange: (e) => {
                    e.target.value = formatNumberInput(e.target.value);
                  },
                })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {editForm.formState.errors.exchangeRate && (
                <p className="text-xs text-red-500 mt-1 ml-2">
                  {editForm.formState.errors.exchangeRate.message}
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
                {...editForm.register("domesticShipJpy", {
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
                    {...editForm.register("shippingToVn", {
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
                    value={tempWeightEdit}
                    onChange={(e) => {
                      setTempWeightEdit(e.target.value);
                      const weight = parseFloat(e.target.value);
                      if (!isNaN(weight) && settings?.shippingVnPerKg) {
                        const calculatedCost =
                          weight * Number(settings.shippingVnPerKg);
                        editForm.setValue(
                          "shippingToVn",
                          formatNumberInput(calculatedCost),
                        );
                      } else if (e.target.value === "") {
                        editForm.setValue("shippingToVn", "");
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
              {...editForm.register("serviceFeeRate")}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              Link tham khảo (nếu có)
            </label>
            <input
              type="url"
              {...editForm.register("url")}
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
                editForm.formState.isSubmitting || updateBatchMutation.isPending
              }
              className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer text-sm"
            >
              {editForm.formState.isSubmitting || updateBatchMutation.isPending
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
