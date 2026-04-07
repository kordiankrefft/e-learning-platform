export type LessonProgressDto = {
  id: number;
  userId: number;
  userName?: string | null;
  lessonId: number;
  lessonTitle?: string | null;
  progressPercent: number;
  lastViewedAt: string;
  isActive: boolean;
};

export type LessonProgressCreateDto = {
  lessonId: number;
  progressPercent: number;
};
