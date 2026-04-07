export type AnnouncementDto = {
  id: number;
  title: string;
  body: string;
  isPublished: boolean;
  publishAt: string | null;
  expiresAt: string | null;
  createdByUserId: number;
  userName?: string | null;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
};

export type AnnouncementCreateDto = {
  title: string;
  body: string;
  isPublished: boolean;
  publishAt?: string | null;
  expiresAt?: string | null;
};

export type AnnouncementEditDto = {
  id: number;
  title: string;
  body: string;
  isPublished: boolean;
  publishAt?: string | null;
  expiresAt?: string | null;
};
