export type PageContentBlockDto = {
  id: number;
  pageKey: string;
  blockType: string;
  content: string | null;
  mediaFileId: number | null;
  mediaFileUrl?: string | null;
  thumbnailName?: string | null;
  orderIndex: number;
  isActive: boolean;
  updatedByUserId: number | null;
  updatedAt: string;
};

export type PageContentBlockCreateDto = {
  pageKey: string;
  blockType: string;
  content?: string | null;
  mediaFileId?: number | null;
  orderIndex: number;
};

export type PageContentBlockEditDto = {
  id: number;
  pageKey: string;
  blockType: string;
  content?: string | null;
  mediaFileId?: number | null;
  orderIndex: number;
};
