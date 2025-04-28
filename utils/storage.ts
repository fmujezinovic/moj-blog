// utils/storage.ts
export const extractPathFromPublicUrl = (url: string): string | null => {
  const marker = "/images/";
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
};
