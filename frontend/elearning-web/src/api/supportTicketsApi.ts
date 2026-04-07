import axiosClient from "./axiosClient";
import type {
  SupportTicketDto,
  SupportTicketCreateDto,
  SupportTicketEditDto,
} from "../types/supportTicket";

export const supportTicketsApi = {
  my: () => axiosClient.get<SupportTicketDto[]>("/my-support-tickets"),
  myAssigned: () => axiosClient.get<SupportTicketDto[]>("/my-assigned-tickets"),
  getAll: () => axiosClient.get<SupportTicketDto[]>("/support-tickets"),
  getById: (id: number) =>
    axiosClient.get<SupportTicketDto>(`/support-tickets/${id}`),
  create: (dto: SupportTicketCreateDto) =>
    axiosClient.post("/support-tickets", dto),
  update: (id: number, dto: SupportTicketEditDto) =>
    axiosClient.put(`/support-tickets/${id}`, dto),
  delete: (id: number) => axiosClient.delete(`/support-tickets/${id}`),
};
