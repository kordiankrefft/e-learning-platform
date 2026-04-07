export type SupportTicketDto = {
  id: number;
  userId: number;
  userName?: string | null;
  courseId: number | null;
  courseTitle?: string | null;
  assignedTutorId: number | null;
  assignedTutorName?: string | null;
  title: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
  isActive: boolean;
};

export type SupportTicketCreateDto = {
  courseId: number | null;
  title: string;
  status: string;
};

export type SupportTicketEditDto = {
  id: number;
  courseId: number | null;
  assignedTutorId: number | null;
  title: string;
  status: string;
};
