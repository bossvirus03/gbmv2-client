import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, updateExpense, deleteExpense, Expense } from "@/services/expenseService";

export const useExpensesQuery = () => {
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });
};

export const useCreateExpenseMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateExpenseMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Expense> }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteExpenseMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
