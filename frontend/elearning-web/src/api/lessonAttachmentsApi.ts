import axiosClient from "./axiosClient";
import type {
  LessonAttachmentCreateDto,
  LessonAttachmentDto,
  LessonAttachmentEditDto,
} from "../types/lessonAttachment";

export const lessonAttachmentsApi = {
  getForLesson: (lessonId: number) =>
    axiosClient.get<LessonAttachmentDto[]>(`/lessons/${lessonId}/attachments`),
  getAll: () => axiosClient.get<LessonAttachmentDto[]>("/lesson-attachments"),
  getById: (id: number) =>
    axiosClient.get<LessonAttachmentDto>(`/lesson-attachments/${id}`),
  create: (dto: LessonAttachmentCreateDto) =>
    axiosClient.post<void>("/lesson-attachments", dto),
  update: (id: number, dto: LessonAttachmentEditDto) =>
    axiosClient.put<void>(`/lesson-attachments/${id}`, dto),
  delete: (id: number) => axiosClient.delete<void>(`/lesson-attachments/${id}`),
};
