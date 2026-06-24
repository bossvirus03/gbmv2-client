export const API_ENDPOINTS = {
  BATCH: {
    BASE: '/batch',
    DETAIL: (batchId: string | number) => `/batch/${batchId}`,
    PRODUCTS: (batchId: string | number) => `/batch/${batchId}/products`,
    PRODUCT_DETAIL: (batchId: string | number, productId: string | number) => `/batch/${batchId}/products/${productId}`,
    UPLOAD: (batchId: string | number) => `/batch/${batchId}/products/upload`,
  },
  CAPITAL: {
    BASE: '/capital',
    DETAIL: (id: string | number) => `/capital/${id}`,
  },
  CUSTOMER: {
    BASE: '/customers',
    DETAIL: (id: string | number) => `/customers/${id}`,
  },
  EXPENSE: {
    BASE: '/expense',
    DETAIL: (id: string | number) => `/expense/${id}`,
  },
  ORDER: {
    BASE: '/order',
    DETAIL: (id: string | number) => `/order/${id}`,
    SELL: '/order/sell',
  },
  ORDER_ITEM: {
    BASE: '/order-items',
    DETAIL: (id: string | number) => `/order-items/${id}`,
  },
  PRODUCT: {
    BASE: '/products',
    DETAIL: (id: string | number) => `/products/${id}`,
  },
  R2: {
    STORAGE: '/r2/storage',
  },
  SETTING: {
    BASE: '/settings',
  },
  USER: {
    BASE: '/user',
    DETAIL: (id: string | number) => `/user/${id}`,
  },
} as const;
