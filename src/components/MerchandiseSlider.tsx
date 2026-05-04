import React, { useState } from "react";

type Product = {
  id: number;
  batchId: number;
  imageUrl: string;
};

type SaleForm = {
  customerName: string;
  customerPhone: string;
  price: string;
  deposit: string;
  note: string;
};

type MerchandiseSliderProps = {
  products: Product[];
  onSubmitSale: (productId: number, form: SaleForm) => Promise<void> | void;
};

const emptyForm: SaleForm = {
  customerName: "",
  customerPhone: "",
  price: "",
  deposit: "",
  note: "",
};

function MerchandiseSlider({ products, onSubmitSale }: MerchandiseSliderProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [form, setForm] = useState<SaleForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const openForm = (productId: number) => {
    setSelectedProductId(productId);
    setForm(emptyForm);
  };

  const closeForm = () => setSelectedProductId(null);

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone || !form.price) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    if (!selectedProductId) return;

    setSubmitting(true);
    try {
      await onSubmitSale(selectedProductId, form);
      closeForm();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi lưu thông tin!");
    } finally {
      setSubmitting(false);
    }
  };

  if (products.length === 0) {
    return <div className="text-center py-12 text-gray-500">Chưa có sản phẩm trong batch này.</div>;
  }

  return (
    <>
      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={product.imageUrl}
                alt="product"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            </div>

            <div className="p-4">
              <button
                onClick={() => openForm(product.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-95 text-sm"
              >
                Bán sản phẩm
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {selectedProductId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md md:max-w-lg max-h-[92vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">Thông tin bán hàng</h3>
              <button
                onClick={closeForm}
                className="text-3xl text-gray-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5 overflow-auto flex-1">
              <input
                type="text"
                placeholder="Tên khách hàng *"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />

              <input
                type="tel"
                placeholder="Số điện thoại *"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />

              <input
                type="number"
                placeholder="Giá bán (VNĐ) *"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />

              <input
                type="number"
                placeholder="Tiền cọc (VNĐ)"
                value={form.deposit}
                onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />

              <textarea
                placeholder="Ghi chú"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={4}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-y"
              />
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={closeForm}
                className="flex-1 py-4 border font-medium rounded-2xl hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl transition"
              >
                {submitting ? "Đang lưu..." : "Xác nhận bán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MerchandiseSlider;