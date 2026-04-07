export type CourseCategoryDto = {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type CourseCategoryCreateDto = {
  name?: string | null;
  description?: string | null;
};

export type CourseCategoryEditDto = {
  id: number;
  name?: string | null;
  description?: string | null;
};
