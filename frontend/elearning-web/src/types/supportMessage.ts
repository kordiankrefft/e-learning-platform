export type SupportMessageDto = {
  id: number;
  supportTicketId: number;
  supportTicketTitle?: string | null;
  fromUserId: number;
  fromUserName?: string | null;
  messageBody: string;
  sentAt: string;
  isActive: boolean;
};

export type SupportMessageCreateDto = {
  supportTicketId: number;
  supportTicketTitle?: string | null;
  messageBody: string;
};
