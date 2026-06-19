import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "@/hooks/useExpenses";
import { Expense } from "@/services/expenseService";
import { Plus, Edit2, Trash2, Search, Calendar, FileText } from "lucide-react";
import { formatVND, formatNumberInput, parseNumberInput } from "@/lib/utils";

type ExpenseFormField = {
  content: string;
  amount: string;
  date: string;
};

function ExpensePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // React Query Custom Hooks
  const { data: expenses = [], isLoading } = useExpensesQuery();

  const createMutation = useCreateExpenseMutation(() => {
    alert("✅ Thêm chi phí thành công!");
    closeModal();
  });

  const updateMutation = useUpdateExpenseMutation(() => {
    alert("✅ Cập nhật chi phí thành công!");
    closeModal();
  });

  const deleteMutation = useDeleteExpenseMutation(() => {
    alert("✅ Xóa chi phí thành công!");
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormField>();

  const openAddModal = () => {
    setEditingExpense(null);
    reset({
      content: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    reset({
      content: expense.content,
      amount: formatNumberInput(String(expense.amount)),
      date: new Date(expense.date).toISOString().split("T")[0],
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const onSubmit = (data: ExpenseFormField) => {
    const payload = {
      content: data.content,
      amount: parseNumberInput(String(data.amount)),
      date: new Date(data.date).toISOString(),
    };

    if (editingExpense) {
      updateMutation.mutate(
        { id: editingExpense.id, data: payload as any },
        {
          onError: (err: any) => {
            console.error(err);
            alert(err?.response?.data?.message || "❌ Lỗi khi cập nhật");
          },
        },
      );
    } else {
      createMutation.mutate(payload as any, {
        onError: (err: any) => {
          console.error(err);
          alert(err?.response?.data?.message || "❌ Lỗi khi thêm chi phí");
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa khoản chi phí này?")) {
      deleteMutation.mutate(id, {
        onError: (err: any) => {
          console.error(err);
          alert("❌ Lỗi khi xóa chi phí");
        },
      });
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((e) =>
    e.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Total expenses amount
  const totalAmount = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Chi phí</h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách chi phí vận hành và phát sinh của doanh nghiệp
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-sm"
        >
          <Plus size={18} />
          Thêm khoản chi
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-3xl p-6 shadow-md">
          <p className="text-xs uppercase tracking-wider text-red-100 font-semibold">
            Tổng chi phí lọc được
          </p>
          <h3 className="text-3xl font-bold mt-2">{formatVND(totalAmount)}</h3>
          <p className="text-xs text-red-100/80 mt-2">
            Dựa trên {filteredExpenses.length} khoản chi phí bên dưới
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex items-center">
        <Search className="text-gray-400 ml-3" size={20} />
        <input
          type="text"
          placeholder="Tìm chi phí bằng nội dung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-4 py-3 outline-none text-sm placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Đang tải danh sách chi phí...
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
          💸 Chưa ghi nhận khoản chi phí nào phù hợp.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile view: list of cards */}
          <div className="block md:hidden space-y-4">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <FileText size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-gray-800 text-sm break-words">
                    {expense.content}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-600 text-sm">
                    {formatVND(expense.amount)}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    {new Date(expense.date).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => openEditModal(expense)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-blue-100 text-blue-600 rounded-xl transition cursor-pointer text-xs font-semibold"
                  >
                    <Edit2 size={12} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-100 text-red-600 rounded-xl transition cursor-pointer text-xs font-semibold"
                  >
                    <Trash2 size={12} />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view: table */}
          <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Nội dung</th>
                    <th className="px-6 py-4">Số tiền</th>
                    <th className="px-6 py-4">Ngày chi</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-gray-50/50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                        <FileText size={16} className="text-gray-400 shrink-0" />
                        <span className="truncate max-w-xs sm:max-w-md">
                          {expense.content}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-red-600">
                        {formatVND(expense.amount)}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(expense.date).toLocaleDateString("vi-VN")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2.5">
                          <button
                            onClick={() => openEditModal(expense)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-blue-100 text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer text-xs font-semibold"
                          >
                            <Edit2 size={12} />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-red-100 text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer text-xs font-semibold"
                          >
                            <Trash2 size={12} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingExpense ? "Chỉnh sửa khoản chi" : "Thêm khoản chi mới"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nội dung chi *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thanh toán tiền điện tháng 6"
                  {...register("content", {
                    required: "Vui lòng nhập nội dung chi",
                  })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
                {errors.content && (
                  <p className="text-xs text-red-500 mt-1 ml-2">
                    {errors.content.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Số tiền chi (VNĐ) *
                </label>
                <input
                  type="text"
                  placeholder="Nhập số tiền chi"
                  {...register("amount", {
                    required: "Vui lòng nhập số tiền chi",
                    validate: (val) =>
                      parseNumberInput(String(val)) > 0 ||
                      "Số tiền phải lớn hơn 0",
                    onChange: (e) => {
                      e.target.value = formatNumberInput(e.target.value);
                    },
                  })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-semibold text-gray-800"
                />

                {errors.amount && (
                  <p className="text-xs text-red-500 mt-1 ml-2">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ngày chi *
                </label>
                <input
                  type="date"
                  {...register("date", { required: "Vui lòng nhập ngày chi" })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-gray-800"
                />
                {errors.date && (
                  <p className="text-xs text-red-500 mt-1 ml-2">
                    {errors.date.message}
                  </p>
                )}
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
                  {isSubmitting
                    ? "Đang xử lý..."
                    : editingExpense
                      ? "Lưu thay đổi"
                      : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpensePage;
