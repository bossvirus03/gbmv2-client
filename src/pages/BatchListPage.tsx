import React, { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  useBatchesQuery,
  useOrderItemsQuery,
  useSellProductMutation,
  useUpdateSaleMutation,
} from "@/hooks/useBatches";
import { useSettingsQuery } from "@/hooks/useSettings";
import { downloadImagesAsZip } from "@/lib/downloadHelper";
import { formatVND } from "@/lib/utils";
import { Batch } from "@/services/batchService";
import { Plus, Layers, Image as ImageIcon, DollarSign } from "lucide-react";

// Import components con mới
import { CreateBatchModal } from "@/components/batch/CreateBatchModal";
import { EditBatchModal } from "@/components/batch/EditBatchModal";
import { AddProductModal } from "@/components/batch/AddProductModal";
import { BatchItem } from "@/components/batch/BatchItem";

const BatchListPage = () => {
  const { toast, progress } = useToast();
  const [expandedBatch, setExpandedBatch] = useState<number | null>(null);

  // States quản lý modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  // Fetch dữ liệu từ server
  const { data: batches = [], isLoading } = useBatchesQuery();
  const { data: orderItems = [] } = useOrderItemsQuery();
  const { data: settings } = useSettingsQuery();

  // Mutations
  const sellProductMutation = useSellProductMutation(() => {
    toast.success("Bán sản phẩm thành công!");
  });

  const updateSaleMutation = useUpdateSaleMutation(() => {
    toast.success("Cập nhật thông tin giao dịch thành công!");
  });

  // Tính toán số liệu tổng hợp
  const totalBatchesCount = batches.length;
  const totalProductsCount = batches.reduce(
    (sum, b) => sum + (b.products?.length || 0),
    0,
  );
  const totalInvestmentCost = batches.reduce((sum, batch) => {
    const jpy = Number(batch.jpyAmount || 0);
    const rate = Number(batch.exchangeRate || 0);
    const domesticShip = Number(batch.domesticShipJpy || 0);
    const shippingVn = Number(batch.shippingToVn || 0);
    const serviceFeeRate = Number(batch.serviceFeeRate || 0);
    const serviceFee = (jpy + domesticShip) * rate * (serviceFeeRate / 100);
    return sum + jpy * rate + domesticShip * rate + shippingVn + serviceFee;
  }, 0);

  const { totalEstProfit, totalRealProfit } = batches.reduce(
    (acc, batch) => {
      const jpy = Number(batch.jpyAmount || 0);
      const rate = Number(batch.exchangeRate || 0);
      const domesticShip = Number(batch.domesticShipJpy || 0);
      const shippingVn = Number(batch.shippingToVn || 0);
      const serviceFeeRate = Number(batch.serviceFeeRate || 0);
      const serviceFee = (jpy + domesticShip) * rate * (serviceFeeRate / 100);
      const batchCost =
        jpy * rate + domesticShip * rate + shippingVn + serviceFee;

      let estRevenue = 0;
      let realRevenue = 0;

      (batch.products || []).forEach((product) => {
        const orderItem = orderItems.find(
          (item) =>
            item.productId === product.id && item.order?.status !== "CANCELLED",
        );

        if (orderItem) {
          if (product.status === "SOLD") {
            estRevenue += Number(orderItem.price || 0);
            realRevenue += Number(orderItem.price || 0);
          } else if (product.status === "DEPOSIT") {
            estRevenue += Number(orderItem.price || 0);
            realRevenue += Number(orderItem.deposit || 0);
          }
        }
      });

      acc.totalEstProfit += estRevenue - batchCost;
      acc.totalRealProfit += realRevenue - batchCost;
      return acc;
    },
    { totalEstProfit: 0, totalRealProfit: 0 },
  );

  const toggleExpand = (id: number) => {
    setExpandedBatch(expandedBatch === id ? null : id);
  };

  const handleSale = async (productId: number, form: any) => {
    try {
      await sellProductMutation.mutateAsync({ productId, form });
    } catch (err: any) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi thực hiện bán hàng!");
      throw err;
    }
  };

  const handleUpdateSale = async (
    productId: number,
    orderItemId: number,
    form: any,
  ) => {
    try {
      await updateSaleMutation.mutateAsync({ productId, orderItemId, form });
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Có lỗi xảy ra khi cập nhật giao dịch!");
      throw err;
    }
  };

  // Tải tất cả ảnh chưa bán của tất cả lô hàng
  const downloadAllImagesAllBatches = async () => {
    const urls: string[] = [];
    batches.forEach((b) => {
      (b.products || []).forEach((p) => {
        if (p.imageUrl && p.status === "AVAILABLE") {
          urls.push(p.imageUrl);
        }
      });
    });

    if (urls.length === 0) {
      toast.error(
        "Không có sản phẩm chưa bán nào có hình ảnh trong tất cả các lô hàng!",
      );
      return;
    }

    try {
      progress.show("Đang chuẩn bị nén ảnh các lô hàng...", "download");
      await downloadImagesAsZip(
        urls,
        "tat_ca_anh_cac_lo_hang",
        (current, total) => {
          const percent = (current / total) * 100;
          progress.update(percent);
        },
      );
      progress.hide();
      toast.success("Tải toàn bộ ảnh thành công!");
    } catch (err: any) {
      progress.hide();
      toast.error(err.message || "Có lỗi xảy ra khi tải ảnh!");
    }
  };

  // Tải tất cả ảnh chưa bán của một lô hàng cụ thể
  const downloadAllImagesInBatch = async (batch: Batch) => {
    const urls = (batch.products || [])
      .filter((p) => p.status === "AVAILABLE")
      .map((p) => p.imageUrl)
      .filter(Boolean);

    if (urls.length === 0) {
      toast.error("Lô hàng này không có sản phẩm chưa bán nào có hình ảnh!");
      return;
    }

    const safeBatchName = batch.name.replace(
      /[^a-zA-Z0-9_\u00C0-\u1EF9]/g,
      "_",
    );
    try {
      progress.show(`Đang chuẩn bị nén ảnh lô: ${batch.name}...`, "download");
      await downloadImagesAsZip(
        urls,
        `anh_lo_hang_${safeBatchName}`,
        (current, total) => {
          const percent = (current / total) * 100;
          progress.update(percent);
        },
      );
      progress.hide();
      toast.success(`Tải ảnh lô hàng ${batch.name} thành công!`);
    } catch (err: any) {
      progress.hide();
      toast.error(err.message || "Có lỗi xảy ra khi tải ảnh!");
    }
  };

  if (isLoading)
    return (
      <div className="text-center py-10">Đang tải danh sách lô hàng...</div>
    );

  return (
    <div className="space-y-6">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Lô hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách lô hàng nhập khẩu từ Nhật Bản và tình trạng sản phẩm
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={downloadAllImagesAllBatches}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-semibold rounded-2xl shadow-sm border border-gray-200 transition cursor-pointer text-sm"
          >
            📥 Tải toàn bộ ảnh
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-sm"
          >
            <Plus size={18} />
            Tạo lô hàng mới
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-3xl p-6 border border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">
              Tổng số lô hàng
            </p>
            <h4 className="text-lg font-bold text-gray-800 mt-0.5">
              {totalBatchesCount} lô
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ImageIcon size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">
              Tổng sản phẩm nhập
            </p>
            <h4 className="text-lg font-bold text-gray-800 mt-0.5">
              {totalProductsCount} sản phẩm
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">
              Tổng vốn đầu tư
            </p>
            <h4 className="text-lg font-bold text-emerald-600 mt-0.5">
              {formatVND(totalInvestmentCost)}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">
              Tổng lãi ước tính
            </p>
            <h4
              className={`text-lg font-bold mt-0.5 ${totalEstProfit >= 0 ? "text-green-600" : "text-red-500"}`}
            >
              {totalEstProfit >= 0 ? "+" : ""}
              {formatVND(totalEstProfit)}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">
              Tổng lãi thực tế
            </p>
            <h4
              className={`text-lg font-bold mt-0.5 ${totalRealProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              {totalRealProfit >= 0 ? "+" : ""}
              {formatVND(totalRealProfit)}
            </h4>
          </div>
        </div>
      </div>

      {/* Batches Cards List */}
      <div className="space-y-6">
        {batches.map((batch) => (
          <BatchItem
            key={batch.id}
            batch={batch}
            isExpanded={expandedBatch === batch.id}
            onToggleExpand={() => toggleExpand(batch.id)}
            onEditClick={(b) => {
              setEditingBatch(b);
              setIsEditModalOpen(true);
            }}
            onAddProductClick={(id) => {
              setSelectedBatchId(id);
              setIsAddProductModalOpen(true);
            }}
            orderItems={orderItems}
            onSaleSubmit={handleSale}
            onSaleUpdate={handleUpdateSale}
            downloadAllImagesInBatch={downloadAllImagesInBatch}
          />
        ))}
      </div>

      {/* MODAL TẠO BATCH MỚI */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        settings={settings}
      />

      {/* MODAL SỬA BATCH */}
      <EditBatchModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBatch(null);
        }}
        batch={editingBatch}
        settings={settings}
      />

      {/* MODAL THÊM SẢN PHẨM MỚI */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setSelectedBatchId(null);
        }}
        batchId={selectedBatchId}
      />
    </div>
  );
};

export default BatchListPage;
