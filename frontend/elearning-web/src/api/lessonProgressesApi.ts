import axiosClient from "./axiosClient";
import type {
  LessonProgressCreateDto,
  LessonProgressDto,
} from "../types/lessonProgress";

export const lessonProgressApi = {
  createOrUpdate: (dto: LessonProgressCreateDto) =>
    axiosClient.post<void>("/lesson-progress", dto),
  getById: (id: number) =>
    axiosClient.get<LessonProgressDto>(`/lesson-progress/${id}`),
  getAll: () => axiosClient.get<LessonProgressDto[]>("/lesson-progress"),
  delete: (id: number) => axiosClient.delete<void>(`/lesson-progress/${id}`),
};
