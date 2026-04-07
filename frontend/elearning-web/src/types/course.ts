export interface CourseDto {
  id: number;
  courseCategoryId: number | null;
  courseCategoryName?: string | null;
  title: string;
  shortDescription: string | null;
  longDescription: string | null;
  difficultyLevel: string | null;
  status: string;
  thumbnailMediaId: number | null;
  thumbnailUrl: string | null;
  thumbnailName?: string | null;
  tutorUserId: number;
  tutorUserName?: string | null;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CourseCreateDto {
  courseCategoryId: number | null;
  title: string;
  shortDescription: string | null;
  longDescription: string | null;
  difficultyLevel: string | null;
  status: string;
  thumbnailMediaId: number | null;
  tutorUserId: number | null;
}

export interface CourseEditDto {
  id: number;
  courseCategoryId: number | null;
  title: string;
  shortDescription: string | null;
  longDescription: string | null;
  difficultyLevel: string | null;
  status: string;
  thumbnailMediaId: number | null;
}
