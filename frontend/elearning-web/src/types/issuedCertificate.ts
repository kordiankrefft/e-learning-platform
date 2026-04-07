export type IssuedCertificateDto = {
  id: number;
  userId: number;
  userName?: string | null;
  courseId: number;
  courseTitle?: string | null;
  certificateTemplateId: number;
  certificateTemplateName?: string | null;
  issuedAt: string;
  certificateNumber: string;
  fileUrl?: string | null;
  isActive: boolean;
};
