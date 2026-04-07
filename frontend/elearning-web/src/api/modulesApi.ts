import axiosClient from "./axiosClient";
import type {
  ModuleDto,
  ModuleCreateDto,
  ModuleEditDto,
} from "../types/module";

export const modulesApi = {
  getModules: () => axiosClient.get<ModuleDto[]>("/modules"),
  getModule: (id: number) => axiosClient.get<ModuleDto>(`/modules/${id}`),
  getCourseModules: (courseId: number) =>
    axiosClient.get<ModuleDto[]>(`/courses/${courseId}/modules`),
  createModule: (dto: ModuleCreateDto) => axiosClient.post("/modules", dto),
  editModule: (id: number, dto: ModuleEditDto) =>
    axiosClient.put(`/modules/${id}`, dto),
  deleteModule: (id: number) => axiosClient.delete(`/modules/${id}`),
};
