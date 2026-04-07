using Data.Dtos.SupportMessage;
using Data.Dtos.UserNotification;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class SupportMessageService : BaseService, ISupportMessageService
    {
        private readonly IUserNotificationService userNotificationService;

        public SupportMessageService(DatabaseContext databaseContext, IUserNotificationService userNotificationService) : base(databaseContext)
        {
            this.userNotificationService = userNotificationService;
        }

        public async Task CreateAsync(SupportMessageCreateDto dto, int fromUserId)
        {
            var ticket = await databaseContext.SupportTickets
                .FirstOrDefaultAsync(t => t.SupportTicketId == dto.SupportTicketId && t.IsActive);

            if (ticket == null)
                throw new Exception("Ticket not found.");

            SupportMessage message = new()
            {
                SupportTicketId = dto.SupportTicketId,
                FromUserId = fromUserId,
                MessageBody = dto.MessageBody!,
                SentAt = DateTime.UtcNow,
                IsActive = true
            };

            databaseContext.SupportMessages.Add(message);
            await databaseContext.SaveChangesAsync(); // message.SupportMessageId już istnieje

            // ---------- NOTYFIKACJA DLA DRUGIEJ STRONY ----------
            int? receiverUserId = null;

            // Student (owner) pisze do tutora
            if (fromUserId == ticket.UserId)
            {
                receiverUserId = ticket.AssignedTutorId;
            }
            // Tutor pisze do studenta
            else if (ticket.AssignedTutorId.HasValue && fromUserId == ticket.AssignedTutorId.Value)
            {
                receiverUserId = ticket.UserId;
            }

            if (receiverUserId.HasValue)
            {
                var notificationDto = new UserNotificationSupportCreateDto
                {
                    UserId = receiverUserId.Value,
                    Title = "New support message",
                    Body = ticket.Title,
                    SupportTicketId = ticket.SupportTicketId,
                    SupportMessageId = message.SupportMessageId
                };

                await userNotificationService.CreateSupportAsync(notificationDto);
            }
        }

        public async Task DeleteAsync(int id)
        {
            SupportMessage message = databaseContext.SupportMessages
                .FirstOrDefault(item => item.SupportMessageId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnej wiadomości wsparcia o id {id}.");

            message.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<SupportMessageDto>> GetAllAsync()
        {
            List<SupportMessageDto> dtos = await databaseContext.SupportMessages
                .Where(item => item.IsActive)
                .OrderBy(item => item.SupportTicketId)
                .ThenBy(item => item.SentAt)
                .Select(item => new SupportMessageDto()
                {
                    Id = item.SupportMessageId,
                    SupportTicketId = item.SupportTicketId,
                    SupportTicketTitle = item.SupportTicket.Title!,
                    FromUserId = item.FromUserId,
                    FromUserName = item.FromUser.UserProfile!.DisplayName!,
                    MessageBody = item.MessageBody,
                    SentAt = item.SentAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<SupportMessageDto> GetAsync(int id)
        {
            SupportMessageDto dto = await databaseContext.SupportMessages
                .Where(item => item.IsActive && item.SupportMessageId == id)
                .Select(item => new SupportMessageDto()
                {
                    Id = item.SupportMessageId,
                    SupportTicketId = item.SupportTicketId,
                    SupportTicketTitle = item.SupportTicket.Title!,
                    FromUserId = item.FromUserId,
                    FromUserName = item.FromUser.UserProfile!.DisplayName!,
                    MessageBody = item.MessageBody,
                    SentAt = item.SentAt,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnej wiadomości wsparcia o id {id}.");

            return dto;
        }

        public async Task<List<SupportMessageDto>> GetForTicketAsync(int ticketId)
        {
            List<SupportMessageDto> dtos = await databaseContext.SupportMessages
                .Where(item => item.IsActive && item.SupportTicketId == ticketId)
                .OrderBy(item => item.SentAt)
                .Select(item => new SupportMessageDto
                {
                    Id = item.SupportMessageId,
                    SupportTicketId = item.SupportTicketId,
                    FromUserId = item.FromUserId,
                    FromUserName = item.FromUser.UserProfile!.DisplayName!,
                    MessageBody = item.MessageBody,
                    SentAt = item.SentAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }
    }
}
