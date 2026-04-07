import axiosClient from "./axiosClient";
import type {
  UserCourseEnrollmentDto,
  UserCourseEnrollmentCreateDto,
  UserCourseEnrollmentEditDto,
} from "../types/userCourseEnrollment";

export const userCourseEnrollmentsApi = {
  getUserCourseEnrollments: () =>
    axiosClient.get<UserCourseEnrollmentDto[]>("/user-course-enrollments"),
  getUserCourseEnrollment: (id: number) =>
    axiosClient.get<UserCourseEnrollmentDto>(`/user-course-enrollments/${id}`),
  getMyUserCourseEnrollments: () =>
    axiosClient.get<UserCourseEnrollmentDto[]>("/user-course-enrollments/my"),
  createUserCourseEnrollment: (dto: UserCourseEnrollmentCreateDto) =>
    axiosClient.post("/user-course-enrollments", dto),
  editUserCourseEnrollment: (id: number, dto: UserCourseEnrollmentEditDto) =>
    axiosClient.put(`/user-course-enrollments/${id}`, dto),
  deleteUserCourseEnrollment: (id: number) =>
    axiosClient.delete(`/user-course-enrollments/${id}`),
  completeMyUserCourseEnrollment: (id: number) =>
    axiosClient.post(`/user-course-enrollments/${id}/complete`),
};
