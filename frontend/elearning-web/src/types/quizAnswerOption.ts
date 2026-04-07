export interface QuizAnswerOptionDto {
  id: number;
  quizQuestionId: number;
  quizQuestionText?: string | null;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
  isActive: boolean;
}

export interface QuizAnswerOptionCreateDto {
  quizQuestionId: number;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizAnswerOptionEditDto {
  id: number;
  quizQuestionId: number;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}
