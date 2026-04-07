export type QuizTakeAnswerOptionDto = {
  id: number;
  answerText: string;
  orderIndex: number;
};

export type QuizTakeQuestionDto = {
  id: number;
  questionText: string;
  questionType: string;
  points: number;
  orderIndex: number;
  options: QuizTakeAnswerOptionDto[];
};

export type QuizTakeDto = {
  quizId: number;
  title: string;
  description: string | null;
  timeLimitSeconds: number | null;
  passThresholdPct: number | null;
  maxAttempts: number | null;
  questions: QuizTakeQuestionDto[];
};
