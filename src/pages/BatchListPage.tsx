import React, { useEffect, useState } from "react";
import MerchandiseSlider from "../components/MerchandiseSlider";
import { getBatches } from "@/services/batchService";
import { updateBatch } from "@/services/batchService"; // ← Thêm import này

type Batch = {
  id: number;
  name: string;
  jpyAmount: string;
  exchangeRate: string;
  domesticShipJpy: string;
  thumbnail?: string;
  serviceFeeRate: string;
  shippingToVn: string;
  url?: string;
  products: Product[];
};

type Product = {
  id: number;
  batchId: number;
  imageUrl: string;
};

const BatchListPage = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [expandedBatch, setExpandedBatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // State cho modal sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getBatches();
        setBatches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedBatch(expandedBatch === id ? null : id);
  };

  // Mở modal sửa
  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setIsEditModalOpen(true);
  };

  // Đóng modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBatch(null);
  };

  // Xử lý cập nhật
  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    try {
      // ✅ Chuyển sang number trước khi gửi
      const payload = {
        name: editingBatch.name,
        jpyAmount: Number(editingBatch.jpyAmount),
        exchangeRate: Number(editingBatch.exchangeRate),
        domesticShipJpy: Number(editingBatch.domesticShipJpy),
        shippingToVn: Number(editingBatch.shippingToVn),
        serviceFeeRate: Number(editingBatch.serviceFeeRate),
        url: editingBatch.url || undefined,
      };

      await updateBatch(editingBatch.id, payload);

      // Cập nhật lại state (giữ nguyên string để hiển thị)
      setBatches((prev) =>
        prev.map((b) =>
          b.id === editingBatch.id
            ? { ...editingBatch, ...payload } // hoặc map lại giá trị number nếu cần
            : b,
        ),
      );

      alert("✅ Cập nhật thông tin lô thành công!");
      closeEditModal();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message?.join("\n") || "❌ Có lỗi khi cập nhật",
      );
    }
  };

  const handleSale = async (productId: number, form: any) => {
    console.log("Bán sản phẩm:", productId, form);
    alert("Đã lưu thông tin bán hàng!");
  };

  if (loading)
    return <div className="text-center py-10">Đang tải danh sách batch...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Danh sách Batch</h1>

      <div className="space-y-4">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-3xl shadow border overflow-hidden"
          >
            {/* Header Card */}
            {/* Header Card */}
            <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50">
              <div
                className="flex items-center gap-4 flex-1"
                onClick={() => toggleExpand(batch.id)}
              >
                {/* === THUMBNAIL === */}
                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
                  {batch.thumbnail ? (
                    <img
                      src={batch.thumbnail}
                      alt={batch.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log(
                          `❌ Thumbnail load error for batch ${batch.id}:`,
                          batch.thumbnail,
                        );
                        e.currentTarget.style.display = "none";
                        // Hiển thị fallback
                        const fallback = e.currentTarget.parentElement;
                        if (fallback)
                          fallback.innerHTML = `
              <div class="w-full h-full flex items-center justify-center text-[10px] text-gray-400 bg-gray-50">
                No Image
              </div>`;
                      }}
                    />
                  ) : batch.url ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                      <span className="text-xs text-gray-400 text-center px-2">
                        Đang lấy thumbnail...
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Thông tin batch */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold truncate">
                    {batch.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {batch.products.length} sản phẩm •{" "}
                    {Number(batch.exchangeRate).toLocaleString()}đ
                  </p>

                  {batch.url && (
                    <a
                      href={batch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs hover:underline mt-1 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🔗 {new URL(batch.url).hostname}
                    </a>
                  )}
                </div>
              </div>

              {/* Nút chức năng */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(batch);
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition"
                >
                  ✏️ Sửa
                </button>

                <span
                  className="text-2xl transition-transform duration-200 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(batch.id);
                  }}
                >
                  {expandedBatch === batch.id ? "−" : "+"}
                </span>
              </div>
            </div>

            {/* Detail + Slider */}
            {expandedBatch === batch.id && (
              <div className="px-6 pb-6 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tổng JPY</p>
                    <p className="font-semibold">
                      {Number(batch.jpyAmount).toLocaleString()} ¥
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phí ship Nhật</p>
                    <p className="font-semibold">
                      {Number(batch.domesticShipJpy).toLocaleString()} ¥
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phí dịch vụ</p>
                    <p className="font-semibold">{batch.serviceFeeRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ship về VN</p>
                    <p className="font-semibold">
                      {Number(batch.shippingToVn).toLocaleString()} đ
                    </p>
                  </div>
                </div>

                <MerchandiseSlider
                  products={batch.products}
                  onSubmitSale={handleSale}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ==================== MODAL SỬA BATCH ==================== */}
      {isEditModalOpen && editingBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg mx-4 p-8">
            <h2 className="text-2xl font-bold mb-6">Sửa thông tin lô hàng</h2>

            <form onSubmit={handleUpdateBatch} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên lô hàng
                </label>
                <input
                  type="text"
                  value={editingBatch.name}
                  onChange={(e) =>
                    setEditingBatch({ ...editingBatch, name: e.target.value })
                  }
                  className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tổng JPY
                  </label>
                  <input
                    type="number"
                    value={editingBatch.jpyAmount}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        jpyAmount: e.target.value,
                      })
                    }
                    className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tỷ giá (VND)
                  </label>
                  <input
                    type="number"
                    value={editingBatch.exchangeRate}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        exchangeRate: e.target.value,
                      })
                    }
                    className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phí ship Nhật (JPY)
                  </label>
                  <input
                    type="number"
                    value={editingBatch.domesticShipJpy}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        domesticShipJpy: e.target.value,
                      })
                    }
                    className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ship về VN (VND)
                  </label>
                  <input
                    type="number"
                    value={editingBatch.shippingToVn}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        shippingToVn: e.target.value,
                      })
                    }
                    className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phí dịch vụ (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingBatch.serviceFeeRate}
                  onChange={(e) =>
                    setEditingBatch({
                      ...editingBatch,
                      serviceFeeRate: e.target.value,
                    })
                  }
                  className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Link tham khảo (nếu có)
                </label>
                <input
                  type="url"
                  value={editingBatch.url || ""}
                  onChange={(e) =>
                    setEditingBatch({ ...editingBatch, url: e.target.value })
                  }
                  className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-3 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchListPage;
