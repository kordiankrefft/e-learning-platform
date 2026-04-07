import axiosClient from "./axiosClient";
import type { QuizTakeDto } from "../types/quizTake";

export const quizTakeApi = {
  getQuizTake: (quizId: number) =>
    axiosClient.get<QuizTakeDto>(`/quizzes/${quizId}/take`),
};
