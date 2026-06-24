import { useQueryClient } from "@tanstack/react-query";
import { useExpensesQueryBase } from "./expenses/queries";
import {
  useCreateExpenseMutationBase,
  useUpdateExpenseMutationBase,
  useDeleteExpenseMutationBase,
} from "./expenses/mutations";
import { Expense } from "@/services/expenseService";

export const useExpensesQuery = () => {
  return useExpensesQueryBase();
};

export const useCreateExpenseMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useCreateExpenseMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateExpenseMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useUpdateExpenseMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteExpenseMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useDeleteExpenseMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
export type { Expense };


