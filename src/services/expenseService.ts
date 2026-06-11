import apiService from './api';

export type Expense = {
  id: number;
  amount: number;
  date: string;
  content: string;
};

export const getExpenses = async () => {
  const response = await apiService.get<Expense[]>('/expense');
  return response.data;
};

export const getExpenseById = async (id: number | string) => {
  const response = await apiService.get<Expense>(`/expense/${id}`);
  return response.data;
};

export const createExpense = async (data: Omit<Expense, 'id'>) => {
  const response = await apiService.post<Expense>('/expense', data);
  return response.data;
};

export const updateExpense = async (id: number | string, data: Partial<Expense>) => {
  const response = await apiService.put<Expense>(`/expense/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: number | string) => {
  const response = await apiService.delete(`/expense/${id}`);
  return response.data;
};
