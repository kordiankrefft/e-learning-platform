import axiosClient from "./axiosClient";
import type {
  QuizAttemptAnswerDto,
  QuizAttemptAnswerCreateDto,
} from "../types/quizAttemptAnswer";

export const quizAttemptAnswersApi = {
  getAll: () =>
    axiosClient.get<QuizAttemptAnswerDto[]>("/quiz-attempt-answers"),
  getById: (id: number) =>
    axiosClient.get<QuizAttemptAnswerDto>(`/quiz-attempt-answers/${id}`),
  getForAttempt: (attemptId: number) =>
    axiosClient.get<QuizAttemptAnswerDto[]>(
      `/quiz-attempts/${attemptId}/answers`
    ),
  createForAttempt: (attemptId: number, dto: QuizAttemptAnswerCreateDto) =>
    axiosClient.post(`/quiz-attempts/${attemptId}/answers`, dto),
  delete: (id: number) => axiosClient.delete(`/quiz-attempt-answers/${id}`),
};
