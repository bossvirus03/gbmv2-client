import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { createExpense, updateExpense, deleteExpense, Expense } from "@/services/expenseService";

export const useCreateExpenseMutationBase = (
  options?: UseMutationOptions<Expense, Error, Omit<Expense, 'id'>>
) => {
  return useMutation({
    mutationFn: createExpense,
    ...options,
  });
};

export const useUpdateExpenseMutationBase = (
  options?: UseMutationOptions<Expense, Error, { id: number; data: Partial<Expense> }>
) => {
  return useMutation({
    mutationFn: ({ id, data }) => updateExpense(id, data),
    ...options,
  });
};

export const useDeleteExpenseMutationBase = (
  options?: UseMutationOptions<Expense, Error, number | string>
) => {
  return useMutation({
    mutationFn: deleteExpense,
    ...options,
  });
};
