import axiosClient from "./axiosClient";
import type {
  UserNotificationDto,
  UserNotificationEditDto,
} from "../types/userNotification";

export const userNotificationsApi = {
  my: () => axiosClient.get<UserNotificationDto[]>("/user-notifications/my"),
  getById: (id: number) =>
    axiosClient.get<UserNotificationDto>(`/user-notifications/${id}`),
  markAsRead: (id: number) =>
    axiosClient.put(`/user-notifications/${id}`, {
      id,
      isRead: true,
    } as UserNotificationEditDto),
  getAll: () => axiosClient.get<UserNotificationDto[]>("/user-notifications"),
  delete: (id: number) => axiosClient.delete(`/user-notifications/${id}`),
};
