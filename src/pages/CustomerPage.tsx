import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useCustomersQuery, useCreateCustomerMutation, useUpdateCustomerMutation, useDeleteCustomerMutation } from "@/hooks/useCustomers";
import { Customer } from "@/services/customerService";
import { UserPlus, Edit2, Trash2, Search, Phone, User } from "lucide-react";

type CustomerFormField = {
  name: string;
  phone: string;
};

function CustomerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // React Query Custom Hooks
  const { data: customers = [], isLoading } = useCustomersQuery();
  
  const createMutation = useCreateCustomerMutation(() => {
    alert("✅ Thêm khách hàng thành công!");
    closeModal();
  });

  const updateMutation = useUpdateCustomerMutation(() => {
    alert("✅ Cập nhật khách hàng thành công!");
    closeModal();
  });

  const deleteMutation = useDeleteCustomerMutation(() => {
    alert("✅ Xóa khách hàng thành công!");
  });

  // React Hook Form
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormField>();

  const openAddModal = () => {
    setEditingCustomer(null);
    reset({ name: "", phone: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    reset({ name: customer.name, phone: customer.phone });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const onSubmit = (data: CustomerFormField) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data }, {
        onError: (err: any) => {
          console.error(err);
          alert(err?.response?.data?.message || "❌ Lỗi khi cập nhật");
        }
      });
    } else {
      createMutation.mutate(data, {
        onError: (err: any) => {
          console.error(err);
          alert(err?.response?.data?.message || "❌ Lỗi khi thêm khách hàng");
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      deleteMutation.mutate(id, {
        onError: (err: any) => {
          console.error(err);
          alert("❌ Lỗi khi xóa khách hàng hoặc khách hàng đang có đơn hàng!");
        }
      });
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách thông tin và lịch sử giao dịch của khách hàng</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-sm"
        >
          <UserPlus size={18} />
          Thêm khách hàng
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex items-center">
        <Search className="text-gray-400 ml-3" size={20} />
        <input
          type="text"
          placeholder="Tìm khách hàng bằng tên hoặc SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-4 py-3 outline-none text-sm placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Đang tải danh sách khách hàng...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
          🔍 Không tìm thấy khách hàng nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-1.5">
                      <User size={16} className="text-gray-400" />
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Phone size={14} className="text-gray-400" />
                      {customer.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-6 border-t border-gray-50 mt-6">
                <button
                  onClick={() => openEditModal(customer)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-blue-200 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-50 transition cursor-pointer"
                >
                  <Edit2 size={14} />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ tên khách hàng"
                  {...register("name", { required: "Vui lòng nhập tên khách hàng" })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 ml-2">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  {...register("phone", {
                    required: "Vui lòng nhập số điện thoại",
                    pattern: {
                      value: /^[0-9+]{9,12}$/,
                      message: "Số điện thoại không hợp lệ (từ 9 đến 12 số)",
                    },
                  })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1 ml-2">{errors.phone.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition cursor-pointer text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition cursor-pointer text-sm"
                >
                  {isSubmitting ? "Đang xử lý..." : editingCustomer ? "Lưu thay đổi" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerPage;