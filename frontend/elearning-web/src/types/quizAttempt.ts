export interface QuizAttemptDto {
  id: number;
  quizId: number;
  quizTitle?: string | null;
  userId: number;
  userName?: string | null;
  startedAt: string;
  submittedAt: string | null;
  scoreTotal: number | null;
  scorePercent: number | null;
  passed: boolean | null;
  isActive: boolean;
}

export interface QuizAttemptCreateDto {
  quizId: number;
}

export interface QuizAttemptEditDto {
  id: number;
  submittedAt: string | null;
  scoreTotal: number | null;
  scorePercent: number | null;
  passed: boolean | null;
}
