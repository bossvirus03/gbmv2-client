import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/ToastContext";
import { useCustomersQuery, useCreateCustomerMutation } from "@/hooks/useCustomers";
import { useBatchesQuery } from "@/hooks/useBatches";
import { useCreateOrderMutation } from "@/hooks/useOrders";
import {
  ArrowLeft,
  Search,
  User,
  Plus,
  Check,
  X,
  Package,
  Trash2,
  ShoppingBag,
  Notebook,
  ChevronDown,
  ChevronUp,
  Filter
} from "lucide-react";
import { formatVND, formatNumberInput, parseNumberInput } from "@/lib/utils";
import { BatchProduct } from "@/services/batchService";
import { Customer } from "@/services/customerService";

type SelectedProductState = {
  product: BatchProduct;
  batchName: string;
  price: string; // string for raw numeric input rendering
  deposit: string; // string for raw numeric input rendering
};

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Screen States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductState[]>([]);
  const [note, setNote] = useState("");

  // Search & Filter States
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedBatchFilterId, setSelectedBatchFilterId] = useState<number | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);

  // Modals visibility
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);

  // New Customer Form
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  // Queries
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomersQuery();
  const { data: batches = [], isLoading: isLoadingBatches } = useBatchesQuery();

  // Mutations
  const createCustomerMutation = useCreateCustomerMutation();
  const createOrderMutation = useCreateOrderMutation(() => {
    toast.success("Tạo đơn hàng thành công!");
    navigate("/");
  });

  // Action Handlers
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      toast.error("Vui lòng điền tên khách hàng.");
      return;
    }

    const phoneValue = newCustPhone.trim() || `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    createCustomerMutation.mutate(
      {
        name: newCustName.trim(),
        phone: phoneValue,
      },
      {
        onSuccess: (data) => {
          setSelectedCustomer(data);
          setIsCustomerModalOpen(false);
          setIsNewCustomerMode(false);
          setNewCustName("");
          setNewCustPhone("");
          toast.success(`Đã thêm nhanh khách hàng: ${data.name}`);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Không thể tạo khách hàng.");
        },
      }
    );
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(false);
  };

  const handleToggleProductSelection = (product: BatchProduct, batchName: string) => {
    const isAlreadySelected = selectedProducts.some((p) => p.product.id === product.id);

    if (isAlreadySelected) {
      setSelectedProducts((prev) => prev.filter((p) => p.product.id !== product.id));
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          product,
          batchName,
          price: formatNumberInput(String(product.price)),
          deposit: "0",
        },
      ]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.product.id !== productId));
  };

  const updateProductField = (productId: number, field: "price" | "deposit", value: string) => {
    // Format input with local formatting helpers
    const formatted = formatNumberInput(value);
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, [field]: formatted } : item
      )
    );
  };

  const handleSubmitOrder = () => {
    if (!selectedCustomer) {
      toast.error("Vui lòng chọn khách hàng.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm.");
      return;
    }

    const payload = {
      customerId: selectedCustomer.id,
      note: note.trim() || undefined,
      items: selectedProducts.map((p) => ({
        productId: p.product.id,
        price: parseNumberInput(p.price) || 0,
        deposit: parseNumberInput(p.deposit) || 0,
      })),
    };

    createOrderMutation.mutate(payload, {
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Không thể tạo đơn hàng.");
      },
    });
  };

  // Calculations
  const totalItemsCount = selectedProducts.length;
  const totalPrice = selectedProducts.reduce(
    (sum, item) => sum + (parseNumberInput(item.price) || 0),
    0
  );
  const totalDeposit = selectedProducts.reduce(
    (sum, item) => sum + (parseNumberInput(item.deposit) || 0),
    0
  );
  const remainingPayment = totalPrice - totalDeposit;

  // Group selected products by batch name
  const groupedSelectedProducts = useMemo(() => {
    return selectedProducts.reduce((groups, item) => {
      const batchName = item.batchName;
      if (!groups[batchName]) {
        groups[batchName] = [];
      }
      groups[batchName].push(item);
      return groups;
    }, {} as Record<string, SelectedProductState[]>);
  }, [selectedProducts]);

  // Filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const filteredBatches = useMemo(() => {
    return batches
      .filter((batch) => selectedBatchFilterId === null || batch.id === selectedBatchFilterId)
      .map((batch) => {
        const matchedProducts = (batch.products || []).filter(
          (p) =>
            p.status === "AVAILABLE" &&
            (batch.name.toLowerCase().includes(productSearch.toLowerCase()) ||
              p.id.toString().includes(productSearch))
        );
        return {
          ...batch,
          products: matchedProducts,
        };
      })
      .filter((b) => b.products.length > 0);
  }, [batches, selectedBatchFilterId, productSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tạo đơn hàng mới</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bán sản phẩm cho khách hàng từ các lô hàng hiện tại
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column (2 cols on desktop): Setup order detail */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Khách hàng mua</h3>

            {selectedCustomer ? (
              <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{selectedCustomer.name}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">SĐT: {selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-blue-600 cursor-pointer transition active:scale-95"
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsCustomerModalOpen(true);
                  setIsNewCustomerMode(false);
                }}
                className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/10 rounded-2xl cursor-pointer group transition duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition duration-200">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-semibold text-blue-600">Chọn hoặc thêm khách hàng</span>
                <span className="text-xs text-gray-400 mt-1">Yêu cầu thông tin khách hàng để tạo đơn</span>
              </button>
            )}
          </div>

          {/* Product selector */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Chọn sản phẩm bán</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lọc theo lô hàng hoặc tìm theo mã sản phẩm
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {/* Search input */}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã sản phẩm..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                  />
                </div>

                {/* Batch Filter selector */}
                <div className="relative flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50 cursor-pointer">
                  <Filter size={14} className="text-gray-400" />
                  <select
                    value={selectedBatchFilterId || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedBatchFilterId(val ? Number(val) : null);
                    }}
                    className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer pr-1"
                  >
                    <option value="">Tất cả lô</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List of Batches and Products */}
            {isLoadingBatches ? (
              <div className="text-center py-8 text-gray-500 text-sm">Đang tải danh sách lô hàng...</div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center justify-center">
                <ShoppingBag size={32} className="text-gray-300 mb-2" />
                <span>Không tìm thấy sản phẩm khả dụng nào.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBatches.map((batch) => {
                  const isExpanded = expandedBatchId === batch.id;
                  return (
                    <div
                      key={batch.id}
                      className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Batch Expandable Header */}
                      <button
                        onClick={() => setExpandedBatchId(isExpanded ? null : batch.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 text-left transition duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Package size={18} className="text-blue-600" />
                          <div>
                            <span className="font-bold text-gray-800 text-sm">{batch.name}</span>
                            <span className="text-xs text-gray-400 ml-2 font-normal">
                              ({batch.products.length} sản phẩm khả dụng)
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                      </button>

                      {/* Products List in Batch */}
                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white border-t border-gray-100">
                          {batch.products.map((product) => {
                            const isProductSelected = selectedProducts.some(
                              (p) => p.product.id === product.id
                            );
                            return (
                              <button
                                key={product.id}
                                onClick={() => handleToggleProductSelection(product, batch.name)}
                                className={`flex items-center gap-3 p-3 border rounded-xl text-left transition active:scale-[0.99] cursor-pointer ${isProductSelected
                                    ? "border-blue-500 bg-blue-50/10"
                                    : "border-gray-100 hover:border-gray-200"
                                  }`}
                              >
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={batch.name}
                                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                    <ShoppingBag size={18} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">

                                  <p className="text-xs text-gray-400 mt-1">
                                    Giá gốc: {formatVND(product.price)}
                                  </p>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isProductSelected
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-gray-300"
                                    }`}
                                >
                                  {isProductSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column (1 col on desktop): Order Summary & Configurations */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng</h3>

            {/* Selected Products Details Config */}
            {selectedProducts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm flex flex-col items-center justify-center">
                <ShoppingBag size={36} className="text-gray-300 mb-2" />
                <span>Chưa chọn sản phẩm nào</span>
                <span className="text-xs text-gray-400 mt-1">Chọn sản phẩm bên trái để định giá</span>
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto pr-1 space-y-5">
                {Object.entries(groupedSelectedProducts).map(([batchName, items]) => (
                  <div key={batchName} className="space-y-2.5">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-xs text-blue-600 bg-blue-50/40 border border-blue-100/30 rounded-xl">
                      <Package size={14} className="text-blue-500" />
                      <span>Lô: {batchName}</span>
                      <span className="text-[10px] text-gray-400 font-normal ml-auto">
                        ({items.length} sản phẩm)
                      </span>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="p-3.5 border border-gray-100 rounded-2xl space-y-3 bg-white relative group"
                        >
                          {/* Header Item */}
                          <div className="flex items-center gap-3">
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                <ShoppingBag size={14} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-400">
                                Giá gốc: {formatVND(item.product.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveProduct(item.product.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Inputs */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                                Giá bán (VND)
                              </label>
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) => updateProductField(item.product.id, "price", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-gray-800"
                                placeholder="Nhập giá bán"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                                Tiền cọc (VND)
                              </label>
                              <input
                                type="text"
                                value={item.deposit}
                                onChange={(e) => updateProductField(item.product.id, "deposit", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-gray-800"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Note input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Notebook size={14} className="text-gray-400" />
                <span>Ghi chú đơn hàng</span>
              </label>
              <textarea
                placeholder="Nhập ghi chú cho đơn hàng này (không bắt buộc)..."
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Số lượng sản phẩm:</span>
                <span className="font-semibold text-gray-800">{totalItemsCount}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tổng giá bán:</span>
                <span className="font-bold text-gray-800">{formatVND(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tổng tiền đặt cọc:</span>
                <span className="font-bold text-blue-600">{formatVND(totalDeposit)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2.5 flex justify-between font-bold">
                <span className="text-gray-800">Cần thanh toán thêm:</span>
                <span className="text-red-500 text-base">{formatVND(remainingPayment)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/10 cursor-pointer transition duration-150 active:scale-95 disabled:bg-gray-400 disabled:pointer-events-none"
            >
              {createOrderMutation.isPending ? "Đang xử lý..." : "Xác nhận Tạo Đơn Hàng"}
            </button>
          </div>
        </div>

      </div>

      {/* CUSTOMER SELECTION & QUICK CREATION MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg mx-4 p-8 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isNewCustomerMode ? "Tạo khách hàng mới" : "Chọn khách hàng"}
              </h2>
              <button
                onClick={() => {
                  if (isNewCustomerMode) {
                    setIsNewCustomerMode(false);
                  } else {
                    setIsCustomerModalOpen(false);
                  }
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                {isNewCustomerMode ? (
                  <span className="text-blue-600 text-sm font-bold">Quay lại</span>
                ) : (
                  <X size={20} />
                )}
              </button>
            </div>

            {/* Modal Content */}
            {isNewCustomerMode ? (
              /* FORM TẠO MỚI KHÁCH HÀNG */
              <form onSubmit={handleCreateCustomer} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0987654321 (tùy chọn)"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewCustomerMode(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer text-sm"
                  >
                    {createCustomerMutation.isPending ? "Đang lưu..." : "Lưu & Chọn"}
                  </button>
                </div>
              </form>
            ) : (
              /* DANH SÁCH KHÁCH HÀNG */
              <div className="flex-1 flex flex-col min-h-0">
                {/* Search & Quick Add Button Row */}
                <div className="flex gap-2.5 mb-4 shrink-0">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm khách hàng (tên hoặc SĐT)..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  </div>
                  <button
                    onClick={() => setIsNewCustomerMode(true)}
                    className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/15 cursor-pointer active:scale-95 transition"
                    title="Thêm khách hàng mới"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-1 divide-y divide-gray-100">
                  {isLoadingCustomers ? (
                    <div className="text-center py-10 text-gray-500 text-sm">Đang tải khách hàng...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm flex flex-col items-center justify-center">
                      <span>Không tìm thấy khách hàng nào.</span>
                      <button
                        onClick={() => setIsNewCustomerMode(true)}
                        className="mt-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold cursor-pointer transition"
                      >
                        Thêm khách hàng mới
                      </button>
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const isSelected = selectedCustomer?.id === customer.id;
                      return (
                        <button
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className={`w-full flex items-center justify-between py-3.5 px-4 text-left rounded-2xl hover:bg-gray-50 cursor-pointer transition duration-150 ${isSelected ? "bg-blue-50/30 text-blue-600 font-medium" : ""
                            }`}
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-800">{customer.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>
                          </div>
                          {isSelected && <Check size={18} className="text-blue-600" strokeWidth={2.5} />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateOrderPage;
