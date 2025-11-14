import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Chuyển đổi URL tương đối thành URL đầy đủ cho static files
 * @param {string} path - Đường dẫn tương đối (vd: /api/rooms/uploads/image.jpg)
 * @returns {string} URL đầy đủ
 */
export function getStaticFileUrl(path) {
  if (!path) return '';
  
  // Nếu đã là URL đầy đủ (http/https), return luôn
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Nếu là đường dẫn tương đối, thêm base URL (không dùng /api vì static files)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return `${baseUrl}${path}`;
}
