export interface QuizQuestionDto {
  id: number;
  quizId: number;
  quizTitle?: string | null;
  questionText: string;
  questionType: string;
  points: number;
  orderIndex: number;
  isActive: boolean;
}

export interface QuizQuestionCreateDto {
  quizId: number;
  questionText: string;
  questionType: string;
  points: number;
  orderIndex: number;
}

export interface QuizQuestionEditDto {
  id: number;
  quizId: number;
  questionText: string;
  questionType: string;
  points: number;
  orderIndex: number;
}
