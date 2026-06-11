import apiService from './api';

export type BatchProduct = {
	id: number;
	batchId: number;
	imageUrl: string;
	price: number;
	status: "AVAILABLE" | "DEPOSIT" | "SOLD";
};

export type Batch = {
	id: number;
	name: string;
	jpyAmount: number | string;
	exchangeRate: number | string;
	domesticShipJpy: number | string;
	shippingToVn: number | string;
	serviceFeeRate: number | string;
	url?: string | null;
	thumbnail?: string | null;
	products: BatchProduct[];
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

export const createBatch = async (data: any) => {
	const response = await apiService.post<Batch>('/batch', data);
	return response.data;
};

export const addProductToBatch = async (batchId: string | number, data: { imageUrl: string }) => {
	const response = await apiService.post(`/batch/${batchId}/products`, data);
	return response.data;
};

export const addProductsWithImagesUpload = async (
	batchId: string | number, 
	files: File[],
	onUploadProgress?: (progressEvent: any) => void
) => {
	const formData = new FormData();
	files.forEach((file) => {
		formData.append('files', file);
	});
	const response = await apiService.upload(`/batch/${batchId}/products/uploads`, formData, {
		onUploadProgress
	});
	return response.data;
};
