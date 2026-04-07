import axiosClient from "./axiosClient";
import type {
  CourseCategoryDto,
  CourseCategoryCreateDto,
  CourseCategoryEditDto,
} from "../types/courseCategory";

export const courseCategoriesApi = {
  getCourseCategories: () =>
    axiosClient.get<CourseCategoryDto[]>("/course-categories"),
  getCourseCategory: (id: number) =>
    axiosClient.get<CourseCategoryDto>(`/course-categories/${id}`),
  createCourseCategory: (dto: CourseCategoryCreateDto) =>
    axiosClient.post("/course-categories", dto),
  editCourseCategory: (id: number, dto: CourseCategoryEditDto) =>
    axiosClient.put(`/course-categories/${id}`, dto),
  deleteCourseCategory: (id: number) =>
    axiosClient.delete(`/course-categories/${id}`),
};
