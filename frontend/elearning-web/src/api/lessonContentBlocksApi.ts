import axiosClient from "./axiosClient";
import type {
  LessonContentBlockCreateDto,
  LessonContentBlockDto,
  LessonContentBlockEditDto,
} from "../types/lessonContentBlock";

export const lessonContentBlocksApi = {
  getForLesson: (lessonId: number) =>
    axiosClient.get<LessonContentBlockDto[]>(
      `/lessons/${lessonId}/content-blocks`
    ),
  getAll: () =>
    axiosClient.get<LessonContentBlockDto[]>("/lesson-content-blocks"),
  getById: (id: number) =>
    axiosClient.get<LessonContentBlockDto>(`/lesson-content-blocks/${id}`),
  create: (dto: LessonContentBlockCreateDto) =>
    axiosClient.post<void>("/lesson-content-blocks", dto),
  update: (id: number, dto: LessonContentBlockEditDto) =>
    axiosClient.put<void>(`/lesson-content-blocks/${id}`, dto),
  delete: (id: number) =>
    axiosClient.delete<void>(`/lesson-content-blocks/${id}`),
};
