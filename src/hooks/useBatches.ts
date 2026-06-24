import { useQueryClient } from "@tanstack/react-query";
import { useBatchesQueryBase, useOrderItemsQueryBase } from "./batches/queries";
import {
  useAddProductToBatchMutationBase,
  useAddProductsWithImagesUploadMutationBase,
  useCreateBatchMutationBase,
  useUpdateBatchMutationBase,
  useSellProductMutationBase,
  useUpdateSaleMutationBase,
  useDeleteProductMutationBase,
} from "./batches/mutations";
import { Batch } from "@/services/batchService";

export const useBatchesQuery = () => {
  return useBatchesQueryBase();
};

export const useOrderItemsQuery = () => {
  return useOrderItemsQueryBase();
};

export const useAddProductToBatchMutation = (
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();
  return useAddProductToBatchMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useAddProductsWithImagesUploadMutation = (
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();
  return useAddProductsWithImagesUploadMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useCreateBatchMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useCreateBatchMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateBatchMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useUpdateBatchMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useSellProductMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useSellProductMutationBase({
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
  return useUpdateSaleMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["orderItems"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteProductMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useDeleteProductMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
export type { Batch };


