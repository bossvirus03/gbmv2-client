import apiService from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

export type Expense = {
  id: number;
  amount: number;
  date: string;
  content: string;
};

export const getExpenses = async () => {
  const response = await apiService.get<Expense[]>(API_ENDPOINTS.EXPENSE.BASE);
  return response.data;
};

export const getExpenseById = async (id: number | string) => {
  const response = await apiService.get<Expense>(
    API_ENDPOINTS.EXPENSE.DETAIL(id),
  );
  return response.data;
};

export const createExpense = async (data: Omit<Expense, "id">) => {
  const response = await apiService.post<Expense>(
    API_ENDPOINTS.EXPENSE.BASE,
    data,
  );
  return response.data;
};

export const updateExpense = async (
  id: number | string,
  data: Partial<Expense>,
) => {
  const response = await apiService.put<Expense>(
    API_ENDPOINTS.EXPENSE.DETAIL(id),
    data,
  );
  return response.data;
};

export const deleteExpense = async (id: number | string) => {
  const response = await apiService.delete(API_ENDPOINTS.EXPENSE.DETAIL(id));
  return response.data;
};
