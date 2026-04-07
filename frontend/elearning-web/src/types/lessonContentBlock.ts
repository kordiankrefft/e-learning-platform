export type LessonContentBlockDto = {
  id: number;
  lessonId: number;
  lessonTitle?: string | null;
  blockType: string;
  content?: string | null;
  orderIndex: number;
  isActive: boolean;
};

export type LessonContentBlockCreateDto = {
  lessonId: number;
  blockType: string;
  content?: string | null;
  orderIndex: number;
};

export type LessonContentBlockEditDto = {
  id: number;
  lessonId: number;
  blockType: string;
  content?: string | null;
  orderIndex: number;
};
