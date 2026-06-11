import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBatches, updateBatch, createBatch, addProductToBatch, addProductsWithImagesUpload, Batch } from "@/services/batchService";
import { getCustomers, createCustomer, updateCustomer } from "@/services/customerService";
import { createOrder, updateOrder, createSellOrder } from "@/services/orderService";
import { createOrderItem, getOrderItems, updateOrderItem, OrderItem } from "@/services/orderItemService";
import { updateProduct } from "@/services/productService";

export const useBatchesQuery = () => {
  return useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: getBatches,
  });
};

export const useOrderItemsQuery = () => {
  return useQuery<OrderItem[]>({
    queryKey: ["orderItems"],
    queryFn: getOrderItems,
  });
};

export const useAddProductToBatchMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, imageUrl }: { batchId: number; imageUrl: string }) => addProductToBatch(batchId, { imageUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useAddProductsWithImagesUploadMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      batchId, 
      files, 
      onUploadProgress 
    }: { 
      batchId: number; 
      files: File[]; 
      onUploadProgress?: (progressEvent: any) => void 
    }) => addProductsWithImagesUpload(batchId, files, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useCreateBatchMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Batch>) => createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateBatchMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Batch> }) => updateBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useSellProductMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, form }: { productId: number; form: any }) => {
      await createSellOrder({
        customerName: form.customerName,
        customerPhone: form.customerPhone || undefined,
        productId,
        price: Number(form.price),
        deposit: form.status === "SOLD" ? Number(form.price) : Number(form.deposit || 0),
        status: form.status,
        note: form.note || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["orderItems"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateSaleMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      productId, 
      orderItemId, 
      form 
    }: { 
      productId: number; 
      orderItemId: number; 
      form: any 
    }) => {
      // 1. Lấy thông tin chi tiết các order items
      const items = await getOrderItems();
      const currentItem = items.find((item) => item.id === orderItemId);
      if (!currentItem) {
        throw new Error("Không tìm thấy thông tin đơn hàng để chỉnh sửa");
      }

      // 2. Cập nhật thông tin khách hàng nếu có liên kết
      if (currentItem.order?.customer) {
        await updateCustomer(currentItem.order.customer.id, {
          name: form.customerName,
          phone: form.customerPhone || undefined,
        });
      }

      // 3. Cập nhật ghi chú cho đơn hàng
      await updateOrder(currentItem.orderId, {
        note: form.note || undefined,
      });

      // 4. Cập nhật giá và tiền cọc của chi tiết đơn hàng
      const isSold = form.status === "SOLD";
      await updateOrderItem(orderItemId, {
        price: Number(form.price),
        deposit: isSold ? Number(form.price) : Number(form.deposit || 0),
      });

      // 5. Cập nhật trạng thái sản phẩm
      const newStatus = form.status || (Number(form.deposit || 0) >= Number(form.price) ? "SOLD" : "DEPOSIT");
      await updateProduct(productId, {
        status: newStatus,
        price: Number(form.price),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["orderItems"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
