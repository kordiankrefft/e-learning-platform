import axiosClient from "./axiosClient";
import type {
  LessonDto,
  LessonCreateDto,
  LessonEditDto,
} from "../types/lesson";

export const lessonsApi = {
  getLessons: () => axiosClient.get<LessonDto[]>("/lessons"),
  getLesson: (id: number) => axiosClient.get<LessonDto>(`/lessons/${id}`),
  getModuleLessons: (moduleId: number) =>
    axiosClient.get<LessonDto[]>(`/modules/${moduleId}/lessons`),
  createLesson: (dto: LessonCreateDto) => axiosClient.post("/lessons", dto),
  editLesson: (id: number, dto: LessonEditDto) =>
    axiosClient.put(`/lessons/${id}`, dto),
  deleteLesson: (id: number) => axiosClient.delete(`/lessons/${id}`),
};
