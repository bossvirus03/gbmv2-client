import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAddProductToBatchMutation, useAddProductsWithImagesUploadMutation } from "@/hooks/useBatches";
import { useToast } from "@/contexts/ToastContext";
import { Upload } from "lucide-react";

const compressImageIfNeeded = (
  file: File,
  maxSizeBytes: number = 1 * 1024 * 1024,
): Promise<File> => {
  return new Promise((resolve) => {
    // Nếu kích thước đã nhỏ hơn maxSizeBytes thì không cần nén
    if (file.size <= maxSizeBytes) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Giới hạn kích thước tối đa 1600px để giữ chất lượng tốt
        const MAX_WIDTH_HEIGHT = 1600;
        if (width > MAX_WIDTH_HEIGHT || height > MAX_WIDTH_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH_HEIGHT) / width);
            width = MAX_WIDTH_HEIGHT;
          } else {
            width = Math.round((width * MAX_WIDTH_HEIGHT) / height);
            height = MAX_WIDTH_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const compress = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              if (blob.size <= maxSizeBytes || q <= 0.2) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type || "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                compress(q - 0.1);
              }
            },
            file.type || "image/jpeg",
            q,
          );
        };

        compress(quality);
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  batchId,
}) => {
  const { toast, progress } = useToast();

  const [addProductType, setAddProductType] = useState<"upload" | "url">("upload");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const productForm = useForm<{ imageUrl: string }>();

  const addProductToBatchMutation = useAddProductToBatchMutation(() => {
    toast.success("Thêm sản phẩm bằng URL thành công!");
    onClose();
  });

  const addProductsWithImagesUploadMutation = useAddProductsWithImagesUploadMutation(() => {
    toast.success("Tải ảnh lên và thêm sản phẩm thành công!");
    onClose();
  });

  // Reset states khi mở hoặc đóng modal
  useEffect(() => {
    if (isOpen) {
      setAddProductType("upload");
      setImagePreviews([]);
      setSelectedFiles([]);
      productForm.reset({ imageUrl: "" });
    }
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      progress.show("Đang tối ưu dung lượng ảnh...", "generic");
      progress.update(10);

      try {
        const compressedFiles = await Promise.all(
          newFiles.map(async (file, idx) => {
            const res = await compressImageIfNeeded(file);
            const percent = 10 + Math.round(((idx + 1) / newFiles.length) * 80);
            progress.update(percent);
            return res;
          })
        );

        setSelectedFiles((prev) => [...prev, ...compressedFiles]);

        const newPreviews: string[] = [];
        let loadedCount = 0;

        compressedFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              newPreviews.push(reader.result);
            }
            loadedCount++;
            if (loadedCount === compressedFiles.length) {
              setImagePreviews((prev) => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        });
      } catch (err) {
        console.error("Lỗi nén ảnh:", err);
        toast.error("Có lỗi xảy ra trong quá trình tối ưu ảnh!");
      } finally {
        progress.hide();
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitProduct = (data: { imageUrl: string }) => {
    if (!batchId) return;

    if (addProductType === "upload") {
      if (selectedFiles.length === 0) {
        toast.error("Vui lòng chọn ít nhất một tệp ảnh để tải lên");
        return;
      }

      progress.show("Đang tải lên các sản phẩm mới", "upload");

      addProductsWithImagesUploadMutation.mutate(
        {
          batchId,
          files: selectedFiles,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1),
            );
            progress.update(percentCompleted);
          },
        },
        {
          onSuccess: () => {
            progress.hide();
          },
          onError: (err: any) => {
            progress.hide();
            console.error(err);
            toast.error(
              "Không thể tải ảnh lên. Vui lòng kiểm tra lại cấu hình hoặc kết nối! \n"+err
            );
          },
        },
      );
    } else {
      if (!data.imageUrl) {
        toast.error("Vui lòng nhập URL ảnh");
        return;
      }
      addProductToBatchMutation.mutate(
        { batchId, imageUrl: data.imageUrl },
        {
          onError: (err: any) => {
            console.error(err);
            toast.error(
              "Không thể thêm sản phẩm bằng URL. Vui lòng kiểm tra lại đường dẫn!",
            );
          },
        },
      );
    }
  };

  if (!isOpen || !batchId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in animate-duration-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Thêm sản phẩm mới
        </h2>

        {/* Toggle Type */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAddProductType("upload");
              setImagePreviews([]);
              setSelectedFiles([]);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              addProductType === "upload"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Tải ảnh lên
          </button>
          <button
            type="button"
            onClick={() => {
              setAddProductType("url");
              setImagePreviews([]);
              setSelectedFiles([]);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              addProductType === "url"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Dán link ảnh
          </button>
        </div>

        <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-5">
          {addProductType === "upload" ? (
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                Chọn ảnh sản phẩm *
              </label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-blue-500 transition duration-200 bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 text-center font-medium">
                  Click để chọn các tệp hình ảnh
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                URL hình ảnh sản phẩm *
              </label>
              <input
                type="url"
                placeholder="https://..."
                {...productForm.register("imageUrl")}
                onChange={(e) =>
                  setImagePreviews(e.target.value ? [e.target.value] : [])
                }
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}

          {/* Preview images */}
          {imagePreviews.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Xem trước ({imagePreviews.length} ảnh)
              </p>
              {addProductType === "upload" ? (
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 border border-gray-100 rounded-2xl bg-gray-50">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden bg-white group shadow-sm"
                    >
                      <img
                        src={preview}
                        alt={`preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-105 transition cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full aspect-square max-h-48 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={imagePreviews[0]}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent)
                        parent.innerHTML = `<span class="text-xs text-red-500">URL ảnh không hợp lệ</span>`;
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 cursor-pointer text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                addProductToBatchMutation.isPending ||
                addProductsWithImagesUploadMutation.isPending
              }
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl disabled:bg-gray-400 transition cursor-pointer text-sm"
            >
              {addProductToBatchMutation.isPending ||
              addProductsWithImagesUploadMutation.isPending
                ? "Đang lưu..."
                : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
