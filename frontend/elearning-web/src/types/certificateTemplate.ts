export type CertificateTemplateDto = {
  id: number;
  name: string;
  description?: string | null;
  templateBody: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type CertificateTemplateCreateDto = {
  name: string;
  description?: string | null;
  templateBody: string;
};

export type CertificateTemplateEditDto = {
  id: number;
  name: string;
  description?: string | null;
  templateBody: string;
};
