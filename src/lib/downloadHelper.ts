import JSZip from "jszip";

export const downloadImagesAsZip = async (
  imageUrls: string[], 
  zipName: string,
  onProgress?: (current: number, total: number) => void
) => {
  if (imageUrls.length === 0) {
    throw new Error("Không có hình ảnh nào để tải về!");
  }

  const zip = new JSZip();
  const folder = zip.folder("images");
  if (!folder) return;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  let successCount = 0;

  for (let idx = 0; idx < imageUrls.length; idx++) {
    const url = imageUrls[idx];
    
    // Gọi callback cập nhật tiến độ (ví dụ ảnh số idx trên tổng số imageUrls.length)
    if (onProgress) {
      onProgress(idx + 1, imageUrls.length);
    }

    try {
      const proxyUrl = `${API_URL}/proxy-download?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }
      const blob = await response.blob();
      
      let ext = "jpg";
      const contentType = response.headers.get("Content-Type");
      if (contentType) {
        if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("gif")) ext = "gif";
        else if (contentType.includes("jpeg")) ext = "jpeg";
      } else {
        const parts = url.split(".");
        const lastPart = parts[parts.length - 1]?.split("?")[0]?.toLowerCase();
        if (["png", "webp", "gif", "jpeg", "jpg"].includes(lastPart)) {
          ext = lastPart;
        }
      }

      const filename = `sanpham_${idx + 1}.${ext}`;
      folder.file(filename, blob);
      successCount++;
    } catch (error) {
      console.error(`Không thể tải ảnh qua proxy tại index ${idx}: ${url}`, error);
    }

    // Nghỉ 100ms giữa các request để iOS Safari không bị drop hoặc nghẽn kết nối
    if (imageUrls.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (successCount === 0) {
    throw new Error("Không thể tải thành công bất kỳ ảnh nào để tạo file nén!");
  }

  const content = await zip.generateAsync({
    type: "blob",
    mimeType: "application/zip",
    compression: "DEFLATE",
    compressionOptions: {
      level: 5
    }
  });
  const downloadUrl = URL.createObjectURL(content);
  
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${zipName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
};

export const downloadImagesDirectly = async (imageUrls: string[]) => {
  if (imageUrls.length === 0) {
    throw new Error("Không có hình ảnh nào để tải về!");
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  for (let idx = 0; idx < imageUrls.length; idx++) {
    const url = imageUrls[idx];
    try {
      const downloadLink = `${API_URL}/proxy-download?url=${encodeURIComponent(url)}`;
      
      const link = document.createElement("a");
      link.href = downloadLink;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (imageUrls.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    } catch (error) {
      console.error(`Lỗi khi tải ảnh thông qua proxy: ${url}`, error);
    }
  }
};
