export interface LessonDto {
  id: number;
  moduleId: number;
  moduleTitle?: string | null;
  title: string;
  summary: string | null;
  status: string;
  orderIndex: number;
  estimatedMinutes: number | null;
  isActive: boolean;
}

export interface LessonCreateDto {
  moduleId: number;
  title: string | null;
  summary: string | null;
  status: string | null;
  orderIndex: number;
  estimatedMinutes: number | null;
}

export interface LessonEditDto {
  id: number;
  moduleId: number;
  title: string | null;
  summary: string | null;
  status: string | null;
  orderIndex: number;
  estimatedMinutes: number | null;
}
