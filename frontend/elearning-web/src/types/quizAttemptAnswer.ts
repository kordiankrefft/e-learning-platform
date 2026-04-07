export interface QuizAttemptAnswerDto {
  id: number;
  quizAttemptId: number;
  quizQuestionId: number;
  quizQuestionText?: string | null;
  selectedOptionId: number | null;
  selectedOptionText?: string | null;
  openAnswerText: string | null;
  isMarkedCorrect: boolean | null;
  isActive: boolean;
}

export interface QuizAttemptAnswerCreateDto {
  quizQuestionId: number;
  selectedOptionId?: number | null;
  openAnswerText?: string | null;
}
