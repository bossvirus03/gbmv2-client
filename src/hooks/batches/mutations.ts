import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import {
  updateBatch,
  createBatch,
  addProductToBatch,
  addProductsWithImagesUpload,
  deleteProduct,
  Batch,
} from "@/services/batchService";
import { updateCustomer } from "@/services/customerService";
import { updateOrder, createSellOrder } from "@/services/orderService";
import {
  getOrderItems,
  updateOrderItem,
} from "@/services/orderItemService";
import { updateProduct } from "@/services/productService";

export const useAddProductToBatchMutationBase = (
  options?: UseMutationOptions<any, Error, { batchId: number; imageUrl: string }>
) => {
  return useMutation({
    mutationFn: ({ batchId, imageUrl }) => addProductToBatch(batchId, { imageUrl }),
    ...options,
  });
};

export const useAddProductsWithImagesUploadMutationBase = (
  options?: UseMutationOptions<
    any,
    Error,
    {
      batchId: number;
      files: File[];
      onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void;
    }
  >
) => {
  return useMutation({
    mutationFn: ({ batchId, files, onUploadProgress }) =>
      addProductsWithImagesUpload(batchId, files, onUploadProgress),
    ...options,
  });
};

export const useCreateBatchMutationBase = (
  options?: UseMutationOptions<Batch, Error, Partial<Batch>>
) => {
  return useMutation({
    mutationFn: (data: Partial<Batch>) => createBatch(data),
    ...options,
  });
};

export const useUpdateBatchMutationBase = (
  options?: UseMutationOptions<Batch, Error, { id: number; data: Partial<Batch> }>
) => {
  return useMutation({
    mutationFn: ({ id, data }) => updateBatch(id, data),
    ...options,
  });
};

export const useSellProductMutationBase = (
  options?: UseMutationOptions<
    void,
    Error,
    { productId: number; form: any }
  >
) => {
  return useMutation({
    mutationFn: async ({ productId, form }) => {
      await createSellOrder({
        customerName: form.customerName,
        customerPhone: form.customerPhone || undefined,
        productId,
        price: Number(form.price),
        deposit:
          form.status === "SOLD"
            ? Number(form.price)
            : Number(form.deposit || 0),
        status: form.status,
        note: form.note || undefined,
      });
    },
    ...options,
  });
};

export const useUpdateSaleMutationBase = (
  options?: UseMutationOptions<
    void,
    Error,
    { productId: number; orderItemId: number; form: any }
  >
) => {
  return useMutation({
    mutationFn: async ({ productId, orderItemId, form }) => {
      const items = await getOrderItems();
      const currentItem = items.find((item) => item.id === orderItemId);
      if (!currentItem) {
        throw new Error("Không tìm thấy thông tin đơn hàng để chỉnh sửa");
      }

      if (currentItem.order?.customer) {
        await updateCustomer(currentItem.order.customer.id, {
          name: form.customerName,
          phone: form.customerPhone || undefined,
        });
      }

      await updateOrder(currentItem.orderId, {
        note: form.note || undefined,
      });

      const isSold = form.status === "SOLD";
      await updateOrderItem(orderItemId, {
        price: Number(form.price),
        deposit: isSold ? Number(form.price) : Number(form.deposit || 0),
      });

      const newStatus =
        form.status ||
        (Number(form.deposit || 0) >= Number(form.price) ? "SOLD" : "DEPOSIT");
      await updateProduct(productId, {
        status: newStatus,
        price: Number(form.price),
      });
    },
    ...options,
  });
};

export const useDeleteProductMutationBase = (
  options?: UseMutationOptions<any, Error, { batchId: number; productId: number }>
) => {
  return useMutation({
    mutationFn: ({ batchId, productId }) => deleteProduct(batchId, productId),
    ...options,
  });
};
