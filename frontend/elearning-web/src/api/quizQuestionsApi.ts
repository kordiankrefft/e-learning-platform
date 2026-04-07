import axiosClient from "./axiosClient";
import type {
  QuizQuestionDto,
  QuizQuestionCreateDto,
  QuizQuestionEditDto,
} from "../types/quizQuestion";

export const quizQuestionsApi = {
  getAll: () => axiosClient.get<QuizQuestionDto[]>("/quiz-questions"),
  getById: (id: number) =>
    axiosClient.get<QuizQuestionDto>(`/quiz-questions/${id}`),
  create: (dto: QuizQuestionCreateDto) =>
    axiosClient.post("/quiz-questions", dto),
  edit: (id: number, dto: QuizQuestionEditDto) =>
    axiosClient.put(`/quiz-questions/${id}`, dto),
  delete: (id: number) => axiosClient.delete(`/quiz-questions/${id}`),
};
