import React from "react";
import { Batch } from "@/services/batchService";
import { formatVND } from "@/lib/utils";
import MerchandiseSlider from "../MerchandiseSlider";
import {
  Coins,
  TrendingUp,
  Percent,
  Truck,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
} from "lucide-react";

interface BatchItemProps {
  batch: Batch;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditClick: (batch: Batch) => void;
  onAddProductClick: (batchId: number) => void;
  orderItems: any[];
  onSaleSubmit: (productId: number, form: any) => Promise<void>;
  onSaleUpdate: (productId: number, orderItemId: number, form: any) => Promise<void>;
  onDeleteProduct: (productId: number) => Promise<void> | void;
  downloadAllImagesInBatch: (batch: Batch) => void;
}

export const BatchItem: React.FC<BatchItemProps> = ({
  batch,
  isExpanded,
  onToggleExpand,
  onEditClick,
  onAddProductClick,
  orderItems,
  onSaleSubmit,
  onSaleUpdate,
  onDeleteProduct,
  downloadAllImagesInBatch,
}) => {
  const jpy = Number(batch.jpyAmount || 0);
  const rate = Number(batch.exchangeRate || 0);
  const domesticShip = Number(batch.domesticShipJpy || 0);
  const shippingVn = Number(batch.shippingToVn || 0);
  const serviceFeeRate = Number(batch.serviceFeeRate || 0);
  
  const serviceFee = (jpy + domesticShip) * rate * (serviceFeeRate / 100);
  const batchCost = jpy * rate + domesticShip * rate + shippingVn + serviceFee;

  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "border-blue-500/50 shadow-md"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      {/* Header Card Area */}
      <div
        className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition ${
          isExpanded ? "bg-blue-50/10" : "hover:bg-gray-50/40"
        }`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Thumbnail Wrapper */}
          <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative shadow-inner">
            {batch.thumbnail ? (
              <img
                src={batch.thumbnail}
                alt={batch.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement;
                  if (fallback)
                    fallback.innerHTML = `<div class="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>`;
                }}
              />
            ) : batch.url ? (
              <div className="w-full h-full flex items-center justify-center bg-blue-50/50">
                <span className="text-[10px] text-blue-500 font-bold text-center px-1 leading-tight">
                  IMAGE
                </span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl bg-gray-50">
                📦
              </div>
            )}
          </div>

          {/* Batch core info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-gray-800 truncate">
                {batch.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600">
                {batch.products?.length || 0} sản phẩm
              </span>
            </div>

            {(() => {
              let estRevenue = 0;
              let realRevenue = 0;

              (batch.products || []).forEach((product) => {
                const orderItem = orderItems.find(
                  (item) => item.productId === product.id && item.order?.status !== "CANCELLED"
                );

                if (orderItem) {
                  if (product.status === "SOLD") {
                    estRevenue += Number(orderItem.price || 0);
                    realRevenue += Number(orderItem.price || 0);
                  } else if (product.status === "DEPOSIT") {
                    estRevenue += Number(orderItem.price || 0);
                    realRevenue += Number(orderItem.deposit || 0);
                  }
                }
              });

              const estProfit = estRevenue - batchCost;
              const realProfit = realRevenue - batchCost;

              return (
                <div className="flex gap-x-4 gap-y-1 mt-1 flex-wrap">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Vốn:{" "}
                    <span className="text-gray-700 font-bold">
                      {formatVND(batchCost)}
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Lãi ước tính:{" "}
                    <span className={`font-bold ${estProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {estProfit >= 0 ? "+" : ""}{formatVND(estProfit)}
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Lãi thực tế:{" "}
                    <span className={`font-bold ${realProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {realProfit >= 0 ? "+" : ""}{formatVND(realProfit)}
                    </span>
                  </p>
                </div>
              );
            })()}

            {batch.url && (
              <a
                href={batch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-xs hover:underline mt-1.5 inline-flex items-center gap-1 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkIcon size={12} />
                Tham khảo nguồn
              </a>
            )}
          </div>
        </div>

        {/* Operations buttons */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadAllImagesInBatch(batch);
            }}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200 transition cursor-pointer"
          >
            📥 Tải ảnh lô
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddProductClick(batch.id);
            }}
            className="px-4 py-2 text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded-xl hover:bg-emerald-100/50 transition cursor-pointer"
          >
            ➕ Thêm sản phẩm
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(batch);
            }}
            className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200/50 transition cursor-pointer"
          >
            ✏️ Sửa lô
          </button>
          <div className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            {isExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
        </div>
      </div>

      {/* Detail section */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {/* Cost breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 text-xs bg-gray-50/50 my-4 rounded-2xl border border-gray-100 p-4">
            <div className="space-y-1">
              <p className="text-gray-400 flex items-center gap-1 font-semibold">
                <Coins size={14} /> Tổng JPY
              </p>
              <p className="font-bold text-sm text-gray-800">
                {Number(batch.jpyAmount).toLocaleString()} ¥
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 flex items-center gap-1 font-semibold">
                <TrendingUp size={14} /> Tỷ giá
              </p>
              <p className="font-bold text-sm text-gray-800">
                {formatVND(batch.exchangeRate)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 flex items-center gap-1 font-semibold">
                <Percent size={14} /> Phí dịch vụ
              </p>
              <p className="font-bold text-sm text-gray-800">
                {batch.serviceFeeRate}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 flex items-center gap-1 font-semibold">
                <Truck size={14} /> Ship về VN
              </p>
              <p className="font-bold text-sm text-gray-800">
                {formatVND(batch.shippingToVn)}
              </p>
            </div>
          </div>

          {/* Merchandise slider */}
          <div className="mt-4">
            <h4 className="font-bold text-gray-700 text-sm mb-3">
              Sản phẩm trong lô hàng
            </h4>
            <MerchandiseSlider
              products={batch.products || []}
              orderItems={orderItems}
              onSubmitSale={onSaleSubmit}
              onUpdateSale={onSaleUpdate}
              onDeleteProduct={onDeleteProduct}
            />
          </div>
        </div>
      )}
    </div>
  );
};
