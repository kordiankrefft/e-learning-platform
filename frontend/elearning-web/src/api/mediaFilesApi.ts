import axiosClient from "./axiosClient";
import type {
  MediaFileCreateDto,
  MediaFileDto,
  MediaFileEditDto,
} from "../types/mediaFile";

export const mediaFilesApi = {
  getAll: () => axiosClient.get<MediaFileDto[]>("/media-files"),
  getById: (id: number) => axiosClient.get<MediaFileDto>(`/media-files/${id}`),
  create: (dto: MediaFileCreateDto) =>
    axiosClient.post<MediaFileDto>("/media-files", dto),
  update: (id: number, dto: MediaFileEditDto) =>
    axiosClient.put<MediaFileDto>(`/media-files/${id}`, dto),
  delete: (id: number) => axiosClient.delete(`/media-files/${id}`),
};
