import axiosClient from "./axiosClient";
import type {
  QuizAnswerOptionDto,
  QuizAnswerOptionCreateDto,
  QuizAnswerOptionEditDto,
} from "../types/quizAnswerOption";

export const quizAnswerOptionsApi = {
  getAll: () => axiosClient.get<QuizAnswerOptionDto[]>("/quiz-answer-options"),
  getById: (id: number) =>
    axiosClient.get<QuizAnswerOptionDto>(`/quiz-answer-options/${id}`),
  create: (dto: QuizAnswerOptionCreateDto) =>
    axiosClient.post("/quiz-answer-options", dto),
  edit: (id: number, dto: QuizAnswerOptionEditDto) =>
    axiosClient.put(`/quiz-answer-options/${id}`, dto),
  delete: (id: number) => axiosClient.delete(`/quiz-answer-options/${id}`),
};
