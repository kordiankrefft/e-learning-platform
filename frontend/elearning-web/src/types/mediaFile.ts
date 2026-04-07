export type MediaFileCreateDto = {
  fileUrl: string;
  fileName: string;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
};

export type MediaFileEditDto = {
  id: number;
  fileUrl: string;
  fileName: string;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
};

export type MediaFileDto = {
  id: number;
  fileUrl: string;
  fileName: string;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  uploadedAt: string;
  uploadedByUserId?: number | null;
  userName?: string | null;
  isActive: boolean;
};
