import axiosClient from "./axiosClient";
import type { IssuedCertificateDto } from "../types/issuedCertificate";

export const issuedCertificatesApi = {
  getAll: () => axiosClient.get<IssuedCertificateDto[]>("/issued-certificates"),
  getById: (id: number) =>
    axiosClient.get<IssuedCertificateDto>(`/issued-certificates/${id}`),
  delete: (id: number) => axiosClient.delete(`/issued-certificates/${id}`),
  downloadForCourse: (courseId: number) =>
    axiosClient.get(`/courses/${courseId}/certificate/download`, {
      responseType: "blob",
    }),
};
