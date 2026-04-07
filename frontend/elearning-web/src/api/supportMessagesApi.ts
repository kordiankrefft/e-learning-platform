import axiosClient from "./axiosClient";
import type {
  SupportMessageDto,
  SupportMessageCreateDto,
} from "../types/supportMessage";

export const supportMessagesApi = {
  getForTicket: (ticketId: number) =>
    axiosClient.get<SupportMessageDto[]>(
      `/support-tickets/${ticketId}/messages`
    ),
  create: (dto: SupportMessageCreateDto) =>
    axiosClient.post("/support-messages", dto),
  getAll: () => axiosClient.get<SupportMessageDto[]>("/support-messages"),
  getById: (id: number) =>
    axiosClient.get<SupportMessageDto>(`/support-messages/${id}`),
  delete: (id: number) => axiosClient.delete(`/support-messages/${id}`),
};
