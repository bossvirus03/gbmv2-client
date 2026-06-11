import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
} from "@/hooks/useUsers";
import { getAccessToken } from "@/lib/asyncLocalstoragate";
import { User } from "@/services/userService";
import { UserPlus, Trash2, User as UserIcon } from "lucide-react";

type UserFormField = {
  email: string;
};

function UserPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // Decode active user to prevent self-deletion
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const payload = JSON.parse(jsonPayload);
        if (payload && payload.username) {
          setCurrentUsername(payload.username);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // React Query Custom Hooks
  const { data: users = [], isLoading } = useUsersQuery();

  const createMutation = useCreateUserMutation(() => {
    alert("✅ Thêm tài khoản thành công!");
    closeModal();
  });

  const deleteMutation = useDeleteUserMutation(() => {
    alert("✅ Xóa tài khoản thành công!");
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormField>();

  const openAddModal = () => {
    reset({ email: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = (data: UserFormField) => {
    if (!data.email) {
      alert("Vui lòng nhập email");
      return;
    }
    createMutation.mutate(
      { email: data.email },
      {
        onError: (err: any) => {
          console.error(err);
          alert(
            err?.response?.data?.message ||
              "❌ Lỗi khi thêm tài khoản (có thể email đã tồn tại)",
          );
        },
      },
    );
  };

  const handleDelete = (user: User) => {
    if (user.username === currentUsername) {
      alert("❌ Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.username}"?`)) {
      deleteMutation.mutate(user.id, {
        onError: (err: any) => {
          console.error(err);
          alert("❌ Lỗi khi xóa tài khoản");
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý Tài khoản
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách người dùng truy cập hệ thống
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-sm"
        >
          <UserPlus size={18} />
          Thêm tài khoản
        </button>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Đang tải danh sách tài khoản...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
          👥 Không có tài khoản nào khác trong hệ thống.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const isMe = user.username === currentUsername;
            return (
              <div
                key={user.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-12 h-12 rounded-2xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <UserIcon size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-1.5">
                          {user.username}
                          {isMe && (
                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              Bạn
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user.email || "Chưa cập nhật email"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-6 border-t border-gray-50 mt-6">
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={isMe}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 border rounded-xl text-xs font-semibold transition ${
                      isMe
                        ? "border-gray-100 text-gray-300 cursor-not-allowed"
                        : "border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    }`}
                  >
                    <Trash2 size={14} />
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Thêm tài khoản mới
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Địa chỉ Email (Gmail) *
                </label>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  {...register("email", {
                    required: "Vui lòng nhập địa chỉ email",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Địa chỉ email không hợp lệ",
                    },
                  })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 ml-2">
                    {errors.email.message}
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
                  {isSubmitting ? "Đang xử lý..." : "Thêm tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPage;
