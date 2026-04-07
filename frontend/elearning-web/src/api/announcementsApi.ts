import axiosClient from "./axiosClient";
import type {
  AnnouncementDto,
  AnnouncementCreateDto,
  AnnouncementEditDto,
} from "../types/announcement";

export const announcementsApi = {
  getAll: () => axiosClient.get<AnnouncementDto[]>("/announcements"),
  getById: (id: number) =>
    axiosClient.get<AnnouncementDto>(`/announcements/${id}`),
  create: (dto: AnnouncementCreateDto) =>
    axiosClient.post("/announcements", dto),
  update: (id: number, dto: AnnouncementEditDto) =>
    axiosClient.put(`/announcements/${id}`, dto),
  delete: (id: number) => axiosClient.delete(`/announcements/${id}`),
};
