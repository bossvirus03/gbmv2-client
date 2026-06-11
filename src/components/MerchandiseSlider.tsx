import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X, User, Phone, DollarSign, Coins, FileText, CheckCircle2, ShoppingBag, Loader2 } from "lucide-react";
import { OrderItem } from "@/services/orderItemService";
import { useCustomersQuery } from "@/hooks/useCustomers";
import { formatNumberInput, parseNumberInput } from "@/lib/utils";


type Product = {
  id: number;
  batchId: number;
  imageUrl: string;
  status: "AVAILABLE" | "DEPOSIT" | "SOLD";
};

type SaleForm = {
  customerName: string;
  customerPhone?: string;
  price: string;
  deposit?: string;
  status: "DEPOSIT" | "SOLD";
  note?: string;
};

type MerchandiseSliderProps = {
  products: Product[];
  orderItems: OrderItem[];
  onSubmitSale: (productId: number, form: SaleForm) => Promise<void> | void;
  onUpdateSale: (productId: number, orderItemId: number, form: SaleForm) => Promise<void> | void;
};

function MerchandiseSlider({ products, orderItems = [], onSubmitSale, onUpdateSale }: MerchandiseSliderProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [editingOrderItemId, setEditingOrderItemId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customerNameInput, setCustomerNameInput] = useState("");

  // Fetch danh sách khách hàng cũ
  const { data: customers = [] } = useCustomersQuery();
  
  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } = useForm<SaleForm>({
    defaultValues: {
      customerName: "",
      customerPhone: "",
      price: "",
      deposit: "",
      status: "DEPOSIT",
      note: "",
    }
  });

  const selectedStatus = watch("status");

  // Lọc danh sách khách hàng dựa trên state gõ của input
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerNameInput.toLowerCase())
  );

  const openForm = (productId: number) => {
    setSelectedProductId(productId);
    setShowSuggestions(false);
    
    // Tìm kiếm xem sản phẩm này đã có đơn hàng giao dịch nào chưa
    const currentItem = orderItems.find((oi) => oi.productId === productId);
    
    if (currentItem) {
      setEditingOrderItemId(currentItem.id);
      const name = currentItem.order?.customer?.name || "";
      setCustomerNameInput(name);
      reset({
        customerName: name,
        customerPhone: currentItem.order?.customer?.phone || "",
        price: formatNumberInput(String(currentItem.price || "")),
        deposit: formatNumberInput(String(currentItem.deposit || "")),
        status: products.find((p) => p.id === productId)?.status === "SOLD" ? "SOLD" : "DEPOSIT",
        note: currentItem.order?.note || "",
      });

    } else {
      setEditingOrderItemId(null);
      setCustomerNameInput("");
      reset({
        customerName: "",
        customerPhone: "",
        price: "",
        deposit: "",
        status: "DEPOSIT",
        note: "",
      });
    }
  };

  const closeForm = () => {
    setSelectedProductId(null);
    setEditingOrderItemId(null);
    setShowSuggestions(false);
    setCustomerNameInput("");
  };

  const onSubmit = async (data: SaleForm) => {
    if (!selectedProductId) return;
    try {
      const parsedData = {
        ...data,
        price: String(parseNumberInput(data.price)),
        deposit: data.deposit ? String(parseNumberInput(data.deposit)) : undefined,
      };
      if (editingOrderItemId) {
        // Nếu đang chỉnh sửa giao dịch cũ
        await onUpdateSale(selectedProductId, editingOrderItemId, parsedData);
      } else {
        // Nếu là bán sản phẩm mới
        await onSubmitSale(selectedProductId, parsedData);
      }
      closeForm();
    } catch (error) {
      console.error(error);
    }
  };


  if (products.length === 0) {
    return <div className="text-center py-12 text-gray-500 font-medium">Chưa có sản phẩm trong batch này.</div>;
  }

  // Sắp xếp sản phẩm: AVAILABLE -> DEPOSIT -> SOLD
  const sortedProducts = [...products].sort((a, b) => {
    const statusOrder = { AVAILABLE: 1, DEPOSIT: 2, SOLD: 3 };
    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
  });

  return (
    <>
      {/* Product Grid (Smaller and more columns) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 py-4">
        {sortedProducts.map((product) => {
          const isSold = product.status === "SOLD";
          const isDeposit = product.status === "DEPOSIT";

          // Xác định màu nền và viền nhẹ nhàng dựa trên trạng thái sản phẩm
          const cardBgClass = isSold
            ? "bg-gray-50/70 border-gray-200/40 opacity-75 hover:opacity-100 transition-opacity"
            : isDeposit
            ? "bg-amber-50/25 border-amber-200/35 hover:bg-amber-50/40"
            : "bg-white border-gray-100/80 hover:bg-gray-50/10";

          return (
            <div
              key={product.id}
              className={`group rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:-translate-y-0.5 flex flex-col ${cardBgClass}`}
            >
              <div className="aspect-square relative overflow-hidden bg-gray-50 flex-shrink-0">
                <img
                  src={product.imageUrl}
                  alt="product"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Status Badges ở dạng Tag nhỏ ở góc trên bên trái */}
                {isSold && (
                  <span className="absolute top-1.5 left-1.5 z-10 bg-red-600/95 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm uppercase tracking-wider backdrop-blur-sm">
                    SOLD
                  </span>
                )}
                {isDeposit && (
                  <span className="absolute top-1.5 left-1.5 z-10 bg-amber-500/95 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm uppercase tracking-wider backdrop-blur-sm">
                    DEP
                  </span>
                )}
              </div>

              <div className="p-2 flex-1 flex flex-col justify-end">
                {isSold ? (
                  <button
                    onClick={() => openForm(product.id)}
                    className="w-full bg-gray-100/80 hover:bg-gray-200/60 text-gray-500 font-semibold py-1.5 rounded-xl border border-gray-200/30 transition-all duration-200 active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Sửa
                  </button>
                ) : isDeposit ? (
                  <button
                    onClick={() => openForm(product.id)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-1.5 rounded-xl shadow-sm transition-all duration-200 active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Sửa cọc
                  </button>
                ) : (
                  <button
                    onClick={() => openForm(product.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-1.5 rounded-xl shadow-sm transition-all duration-200 active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Bán
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {selectedProductId && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col transform transition-all max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  {editingOrderItemId ? "Chỉnh sửa giao dịch" : "Thông tin bán hàng"}
                </h3>
              </div>
              <button
                onClick={closeForm}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                
                {/* Trạng thái Bán hàng (Radio Cards) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Trạng thái bán hàng *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                        selectedStatus === "DEPOSIT"
                          ? "border-amber-500 bg-amber-50/40 text-amber-900 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 text-gray-500 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        value="DEPOSIT"
                        {...register("status")}
                        className="sr-only"
                      />
                      <Coins className={`w-5 h-5 mb-1 ${selectedStatus === "DEPOSIT" ? "text-amber-500" : "text-gray-400"}`} />
                      <span className="text-xs font-bold uppercase tracking-wider">Đặt cọc</span>
                    </label>

                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                        selectedStatus === "SOLD"
                          ? "border-green-600 bg-green-50/30 text-green-900 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 text-gray-500 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        value="SOLD"
                        {...register("status")}
                        className="sr-only"
                      />
                      <CheckCircle2 className={`w-5 h-5 mb-1 ${selectedStatus === "SOLD" ? "text-green-600" : "text-gray-400"}`} />
                      <span className="text-xs font-bold uppercase tracking-wider">Đã bán</span>
                    </label>
                  </div>
                </div>

                {/* Tên khách hàng */}
                <div className="space-y-1 relative">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Tên khách hàng *
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nhập tên khách hàng"
                      {...register("customerName", { 
                        required: "Vui lòng nhập tên khách hàng",
                        onChange: (e) => setCustomerNameInput(e.target.value)
                      })}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all duration-200 bg-gray-50/30 focus:bg-white"
                      autoComplete="off"
                    />
                  </div>
                  {errors.customerName && (
                    <p className="text-xs text-red-500 mt-1 ml-2 font-medium">{errors.customerName.message}</p>
                  )}

                  {/* Gợi ý khách hàng cũ */}
                  {showSuggestions && customerNameInput && filteredCustomers.length > 0 && (
                    <div className="absolute z-30 w-full left-0 bg-white border border-gray-200 rounded-2xl mt-1 max-h-48 overflow-y-auto shadow-2xl py-1.5 animate-fade-in pointer-events-auto">
                      <p className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Khách hàng cũ</p>
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Ngăn input bị blur
                            setValue("customerName", customer.name);
                            setValue("customerPhone", customer.phone);
                            setCustomerNameInput(customer.name);
                            setShowSuggestions(false);
                          }}
                          className="px-3.5 py-2 hover:bg-blue-50/60 cursor-pointer flex justify-between items-center transition"
                        >
                          <span className="text-sm font-semibold text-gray-800">{customer.name}</span>
                          <span className="text-xs font-medium text-gray-400 font-mono">{customer.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại (tùy chọn)"
                      {...register("customerPhone")}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all duration-200 bg-gray-50/30 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Giá bán */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Giá bán (VNĐ) *
                  </label>
                  <div className="relative flex items-center">
                    <DollarSign className="absolute left-4 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nhập giá bán thực tế"
                      {...register("price", {
                        required: "Vui lòng nhập giá bán",
                        onChange: (e) => {
                          e.target.value = formatNumberInput(e.target.value);
                        },
                      })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all duration-200 bg-gray-50/30 focus:bg-white"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-1 ml-2 font-medium">{errors.price.message}</p>
                  )}

                </div>

                {/* Tiền cọc (chỉ hiện khi chọn Đặt cọc) */}
                {selectedStatus === "DEPOSIT" ? (
                  <div className="space-y-1 animate-fade-in">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Tiền đặt cọc (VNĐ)
                    </label>
                    <div className="relative flex items-center">
                      <Coins className="absolute left-4 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nhập số tiền đã cọc (tùy chọn)"
                        {...register("deposit", {
                          onChange: (e) => {
                            e.target.value = formatNumberInput(e.target.value);
                          },
                        })}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all duration-200 bg-gray-50/30 focus:bg-white"
                      />
                    </div>
                  </div>

                ) : (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-2.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-green-800 leading-normal font-medium">
                      Khi chọn trạng thái <strong>Đã bán</strong>, hệ thống sẽ tự động ghi nhận số tiền đã thanh toán bằng đúng với <strong>Giá bán</strong> sản phẩm.
                    </p>
                  </div>
                )}

                {/* Ghi chú */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Ghi chú
                  </label>
                  <div className="relative flex items-start">
                    <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                      placeholder="Nhập ghi chú chi tiết đơn hàng (tùy chọn)"
                      {...register("note")}
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all duration-200 resize-none bg-gray-50/30 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 border border-gray-300 font-bold rounded-2xl text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition active:scale-98 cursor-pointer text-xs uppercase tracking-wider"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-2xl shadow-md transition active:scale-98 cursor-pointer text-xs uppercase tracking-wider disabled:from-gray-400 disabled:to-gray-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    "Xác nhận bán"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MerchandiseSlider;