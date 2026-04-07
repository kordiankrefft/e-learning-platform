import axiosClient from "./axiosClient";
import type {
  CertificateTemplateDto,
  CertificateTemplateCreateDto,
  CertificateTemplateEditDto,
} from "../types/certificateTemplate";

export const certificateTemplatesApi = {
  getAll: () =>
    axiosClient.get<CertificateTemplateDto[]>("/certificate-templates"),
  getById: (id: number) =>
    axiosClient.get<CertificateTemplateDto>(`/certificate-templates/${id}`),
  create: (dto: CertificateTemplateCreateDto) =>
    axiosClient.post("/certificate-templates", dto),
  update: (id: number, dto: CertificateTemplateEditDto) =>
    axiosClient.put(`/certificate-templates/${id}`, dto),
  delete: (id: number) => axiosClient.delete(`/certificate-templates/${id}`),
};
