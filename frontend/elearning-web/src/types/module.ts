export interface ModuleDto {
  id: number;
  courseId: number;
  courseTitle?: string | null;
  title: string;
  description: string | null;
  orderIndex: number;
  isActive: boolean;
}

export interface ModuleCreateDto {
  courseId: number;
  title: string | null;
  description: string | null;
  orderIndex: number;
}

export interface ModuleEditDto {
  id: number;
  courseId: number;
  title: string | null;
  description: string | null;
  orderIndex: number;
}
