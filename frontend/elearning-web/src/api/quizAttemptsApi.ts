import axiosClient from "./axiosClient";
import type {
  QuizAttemptDto,
  QuizAttemptCreateDto,
  QuizAttemptEditDto,
} from "../types/quizAttempt";

export const quizAttemptsApi = {
  getAll: () => axiosClient.get<QuizAttemptDto[]>("/quiz-attempts"),
  getById: (id: number) =>
    axiosClient.get<QuizAttemptDto>(`/quiz-attempts/${id}`),
  create: (dto: QuizAttemptCreateDto) =>
    axiosClient.post<{ attemptId: number }>(`/quiz-attempts`, dto),
  edit: (id: number, dto: QuizAttemptEditDto) =>
    axiosClient.put<QuizAttemptDto>(`/quiz-attempts/${id}`, dto),
  delete: (id: number) => axiosClient.delete(`/quiz-attempts/${id}`),
};
