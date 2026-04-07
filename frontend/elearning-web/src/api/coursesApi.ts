import axiosClient from "./axiosClient";
import type {
  CourseDto,
  CourseCreateDto,
  CourseEditDto,
} from "../types/course";

export const coursesApi = {
  getCourses: () => axiosClient.get<CourseDto[]>("/courses"),
  getCourse: (id: number) => axiosClient.get<CourseDto>(`/courses/${id}`),
  getMyTutorCourses: () => axiosClient.get<CourseDto[]>("/courses/my-tutor"),
  createCourse: (dto: CourseCreateDto) => axiosClient.post("/courses", dto),
  editCourse: (id: number, dto: CourseEditDto) =>
    axiosClient.put(`/courses/${id}`, dto),
  deleteCourse: (id: number) => axiosClient.delete(`/courses/${id}`),
};
