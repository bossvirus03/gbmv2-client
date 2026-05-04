import apiService from './api';

export type BatchProduct = {
	id: number;
	name: string;
	description?: string | null;
	image?: string | null;
	price?: number | null;
};

export type Batch = {
	id: number;
	name: string;
	description?: string | null;
	products?: BatchProduct[];
};

export type SellPayload = {
	productId: number;
	customerName: string;
	customerPhone?: string;
	price: number;
	deposit?: number;
	note?: string;
};

export const getBatches = async () => {
	const response = await apiService.get<Batch[]>('/batch');
	return response.data;
};

export const getBatchById = async (batchId: string | number) => {
	const response = await apiService.get<Batch>(`/batch/${batchId}`);
	return response.data;
};

export const createOrder = async (payload: SellPayload) => {
	const response = await apiService.post('/order', payload);
	return response.data;
};

export const updateBatch = async (batchId: string | number, data: Partial<Batch>) => {
	const response = await apiService.put(`/batch/${batchId}`, data);
	return response.data;
}
