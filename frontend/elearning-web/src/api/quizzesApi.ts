import axiosClient from "./axiosClient";
import type { QuizDto, QuizCreateDto, QuizEditDto } from "../types/quiz";

export const quizzesApi = {
  getQuizzes: () => axiosClient.get<QuizDto[]>("/quizzes"),
  getQuiz: (id: number) => axiosClient.get<QuizDto>(`/quizzes/${id}`),
  createQuiz: (dto: QuizCreateDto) => axiosClient.post("/quizzes", dto),
  editQuiz: (id: number, dto: QuizEditDto) =>
    axiosClient.put(`/quizzes/${id}`, dto),
  deleteQuiz: (id: number) => axiosClient.delete(`/quizzes/${id}`),

  getModuleQuiz: (moduleId: number) =>
    axiosClient.get<QuizDto>(`/modules/${moduleId}/quiz`),
};
