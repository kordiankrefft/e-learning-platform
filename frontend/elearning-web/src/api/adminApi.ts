import axiosClient from "./axiosClient";
import type { UserEditDto, UserAdminDto } from "../types/user";
import type { AuditLogDto } from "../types/auditLog";
import type { PagedSlice } from "../types/pagedSlice";

export const adminApi = {
  // USERS
  getUsers: () => axiosClient.get<UserAdminDto[]>("/users"),
  getUser: (id: number) => axiosClient.get<UserAdminDto>(`/users/${id}`),
  editUser: (id: number, dto: UserEditDto) =>
    axiosClient.put(`/users/${id}`, dto),
  deleteUser: (id: number) => axiosClient.delete(`/users/${id}`),

  //IDENTITY
  createRole: (name: string) =>
    axiosClient.get(`/identity/add-role?name=${encodeURIComponent(name)}`),

  addUserToRole: (email: string, roleName: string) =>
    axiosClient.get(
      `/identity/add-user-to-role?email=${encodeURIComponent(
        email
      )}&roleName=${encodeURIComponent(roleName)}`
    ),

  // AUDIT LOGS
  getAuditLogsPaged: (page: number, pageSize: number) =>
    axiosClient.get<PagedSlice<AuditLogDto>>(
      `/audit-logs?page=${page}&pageSize=${pageSize}`
    ),
  getAuditLog: (id: number) =>
    axiosClient.get<AuditLogDto>(`/audit-logs/${id}`),
  deleteAuditLog: (id: number) => axiosClient.delete(`/audit-logs/${id}`),
};
