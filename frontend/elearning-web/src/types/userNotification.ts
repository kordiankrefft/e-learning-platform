export type UserNotificationDto = {
  id: number;
  userId: number;
  userName?: string | null;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  isActive: boolean;
  supportTicketId: number | null;
  supportTicketTitle?: string | null;
  supportMessageId: number | null;
  supportMessageBody?: string | null;
};

export type UserNotificationEditDto = {
  id: number;
  isRead: boolean;
};
