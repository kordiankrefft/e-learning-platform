export interface QuizDto {
  id: number;
  lessonId: number | null;
  lessonTitle?: string | null;
  moduleId: number | null;
  moduleTitle?: string | null;
  title: string;
  description: string | null;
  timeLimitSeconds: number | null;
  passThresholdPct: number | null;
  maxAttempts: number | null;
  isActive: boolean;
  studentPassed?: boolean | null;
}

export interface QuizCreateDto {
  lessonId: number | null;
  moduleId: number | null;
  title: string;
  description: string | null;
  timeLimitSeconds: number | null;
  passThresholdPct: number | null;
  maxAttempts: number | null;
}

export interface QuizEditDto {
  id: number;
  lessonId: number | null;
  moduleId: number | null;
  title: string;
  description: string | null;
  timeLimitSeconds: number | null;
  passThresholdPct: number | null;
  maxAttempts: number | null;
}
