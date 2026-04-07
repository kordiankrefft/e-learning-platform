export type LessonAttachmentDto = {
  id: number;
  lessonId: number;
  lessonTitle?: string | null;
  fileName: string;
  fileUrl: string;
  description?: string | null;
  isActive: boolean;
};

export type LessonAttachmentCreateDto = {
  lessonId: number;
  fileName: string;
  fileUrl: string;
  description?: string | null;
};

export type LessonAttachmentEditDto = {
  id: number;
  lessonId: number;
  fileName: string;
  fileUrl: string;
  description?: string | null;
};
