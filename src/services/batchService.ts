import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

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
	const response = await apiService.get<Batch[]>(API_ENDPOINTS.BATCH.BASE);
	return response.data;
};

export const getBatchById = async (batchId: string | number) => {
	const response = await apiService.get<Batch>(API_ENDPOINTS.BATCH.DETAIL(batchId));
	return response.data;
};

export const createOrder = async (payload: SellPayload) => {
	const response = await apiService.post(API_ENDPOINTS.ORDER.BASE, payload);
	return response.data;
};

export const updateBatch = async (batchId: string | number, data: Partial<Batch>) => {
	const response = await apiService.put(API_ENDPOINTS.BATCH.DETAIL(batchId), data);
	return response.data;
};

export const createBatch = async (data: any) => {
	const response = await apiService.post<Batch>(API_ENDPOINTS.BATCH.BASE, data);
	return response.data;
};

export const addProductToBatch = async (batchId: string | number, data: { imageUrl: string }) => {
	const response = await apiService.post(API_ENDPOINTS.BATCH.PRODUCTS(batchId), data);
	return response.data;
};

export const deleteProduct = async (batchId: string | number, productId: number) => {
	const response = await apiService.delete(API_ENDPOINTS.BATCH.PRODUCT_DETAIL(batchId, productId));
	return response.data;
};

export const addProductsWithImagesUpload = async (
	batchId: string | number, 
	files: File[],
	onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
) => {
	const totalSize = files.reduce((sum, file) => sum + file.size, 0);
	const uploadedBytes = new Array(files.length).fill(0);
	const imageUrls: string[] = [];

	const chunkSize = 3;
	for (let i = 0; i < files.length; i += chunkSize) {
		const chunk = files.slice(i, i + chunkSize);
		await Promise.all(
			chunk.map(async (file, index) => {
				const fileIndex = i + index;
				const formData = new FormData();
				formData.append('file', file);

				const response = await apiService.upload(API_ENDPOINTS.BATCH.UPLOAD(batchId), formData, {
					onUploadProgress: (progressEvent) => {
						uploadedBytes[fileIndex] = progressEvent.loaded;
						const currentTotalLoaded = uploadedBytes.reduce((sum, val) => sum + val, 0);
						if (onUploadProgress) {
							onUploadProgress({
								loaded: currentTotalLoaded,
								total: totalSize,
							});
						}
					},
				});

				if (response.data && response.data.imageUrl) {
					imageUrls[fileIndex] = response.data.imageUrl;
				}
			})
		);
	}

	return {
		message: 'Thêm sản phẩm thành công',
		count: imageUrls.filter(Boolean).length,
		imageUrls: imageUrls.filter(Boolean),
	};
};

