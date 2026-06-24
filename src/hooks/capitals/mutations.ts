import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { createCapital, updateCapital, deleteCapital, Capital } from "@/services/capitalService";

export const useCreateCapitalMutationBase = (
  options?: UseMutationOptions<Capital, Error, { amount: number; date?: string; content: string }>
) => {
  return useMutation({
    mutationFn: (data) => createCapital(data),
    ...options,
  });
};

export const useUpdateCapitalMutationBase = (
  options?: UseMutationOptions<Capital, Error, { id: number; amount?: number; date?: string; content?: string }>
) => {
  return useMutation({
    mutationFn: ({ id, ...data }) => updateCapital(id, data),
    ...options,
  });
};

export const useDeleteCapitalMutationBase = (
  options?: UseMutationOptions<void, Error, number>
) => {
  return useMutation({
    mutationFn: (id) => deleteCapital(id),
    ...options,
  });
};
