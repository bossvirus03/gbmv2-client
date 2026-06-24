import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getExpenses, Expense } from "@/services/expenseService";

export const useExpensesQueryBase = (options?: Omit<UseQueryOptions<Expense[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: getExpenses,
    ...options,
  });
};
