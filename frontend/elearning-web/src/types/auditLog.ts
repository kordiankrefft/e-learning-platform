export interface AuditLogDto {
  id: number;
  userId: number | null;
  userName?: string | null;
  actionType: string;
  entityName: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  isActive: boolean;
}
