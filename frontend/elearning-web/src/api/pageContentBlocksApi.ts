import axiosClient from "./axiosClient";
import type {
  PageContentBlockDto,
  PageContentBlockCreateDto,
  PageContentBlockEditDto,
} from "../types/pageContentBlock";

export const pageContentBlocksApi = {
  getAll: () => axiosClient.get<PageContentBlockDto[]>("/page-content-blocks"),
  getById: (id: number) =>
    axiosClient.get<PageContentBlockDto>(`/page-content-blocks/${id}`),
  create: (dto: PageContentBlockCreateDto) =>
    axiosClient.post("/page-content-blocks", dto),
  update: (id: number, dto: PageContentBlockEditDto) =>
    axiosClient.put(`/page-content-blocks/${id}`, dto),
  delete: (id: number) => axiosClient.delete(`/page-content-blocks/${id}`),

  getByPageKey: (pageKey: string) =>
    axiosClient.get<PageContentBlockDto[]>(
      `/page-content-blocks/page/${pageKey}`
    ),
};
