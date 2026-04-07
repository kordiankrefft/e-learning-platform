import axiosClient from "./axiosClient";
import type {
  UserCourseAccessDto,
  UserCourseAccessCreateDto,
  UserCourseAccessEditDto,
} from "../types/userCourseAccess";

export const userCourseAccessesApi = {
  getUserCourseAccesses: () =>
    axiosClient.get<UserCourseAccessDto[]>("/user-course-accesses"),
  getUserCourseAccess: (id: number) =>
    axiosClient.get<UserCourseAccessDto>(`/user-course-accesses/${id}`),
  getMyUserCourseAccesses: () =>
    axiosClient.get<UserCourseAccessDto[]>("/user-course-accesses/my"),
  createUserCourseAccess: (dto: UserCourseAccessCreateDto) =>
    axiosClient.post("/user-course-accesses", dto),
  editUserCourseAccess: (id: number, dto: UserCourseAccessEditDto) =>
    axiosClient.put(`/user-course-accesses/${id}`, dto),
  deleteUserCourseAccess: (id: number) =>
    axiosClient.delete(`/user-course-accesses/${id}`),
};
