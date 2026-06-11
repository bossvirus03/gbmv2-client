import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVND(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "0đ";
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(num)) return "0đ";
  return num.toLocaleString("vi-VN") + "đ";
}

export function formatNumberInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  // Loại bỏ mọi ký tự không phải là số
  const str = String(value).replace(/\D/g, "");
  if (!str) return "";
  return Number(str).toLocaleString("vi-VN");
}

export function parseNumberInput(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  // Loại bỏ tất cả dấu chấm phân cách hàng nghìn
  const str = String(value).replace(/\./g, "");
  const num = Number(str);
  return isNaN(num) ? 0 : num;
}


