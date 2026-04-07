using Data.Dtos.UserNotification;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class UserNotificationService : BaseService, IUserNotificationService
    {
        public UserNotificationService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateSupportAsync(UserNotificationSupportCreateDto dto)
        {
            UserNotification notification = new()
            {
                UserId = dto.UserId,
                Title = dto.Title!,
                Body = dto.Body!,
                IsRead = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                SupportTicketId = dto.SupportTicketId,
                SupportMessageId = dto.SupportMessageId
            };

            databaseContext.UserNotifications.Add(notification);
            await databaseContext.SaveChangesAsync();
        }


        public async Task EditAsync(UserNotificationEditDto dto)
        {
            UserNotification notification = databaseContext.UserNotifications
                .FirstOrDefault(item => item.UserNotificationId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego powiadomienia o id {dto.Id}.");

            notification.IsRead = dto.IsRead;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            UserNotification notification = databaseContext.UserNotifications
                .FirstOrDefault(item => item.UserNotificationId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego powiadomienia o id {id}.");

            notification.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<UserNotificationDto>> GetAllAsync()
        {
            List<UserNotificationDto> dtos = await databaseContext.UserNotifications
                .Where(item => item.IsActive)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new UserNotificationDto()
                {
                    Id = item.UserNotificationId,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    Title = item.Title,
                    Body = item.Body,
                    IsRead = item.IsRead,
                    CreatedAt = item.CreatedAt,
                    IsActive = item.IsActive,
                    SupportTicketId = item.SupportTicketId,
                    SupportTicketTitle = item.SupportTicket!.Title,
                    SupportMessageId = item.SupportMessageId,
                    SupportMessageBody = item.SupportMessage!.MessageBody

                })
                .ToListAsync();

            return dtos;
        }

        public async Task<UserNotificationDto> GetAsync(int id)
        {
            UserNotificationDto dto = await databaseContext.UserNotifications
                .Where(item => item.IsActive && item.UserNotificationId == id)
                .Select(item => new UserNotificationDto()
                {
                    Id = item.UserNotificationId,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    Title = item.Title,
                    Body = item.Body,
                    IsRead = item.IsRead,
                    CreatedAt = item.CreatedAt,
                    IsActive = item.IsActive,
                    SupportTicketId = item.SupportTicketId,
                    SupportTicketTitle = item.SupportTicket!.Title,
                    SupportMessageId = item.SupportMessageId,
                    SupportMessageBody = item.SupportMessage!.MessageBody
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego powiadomienia o id {id}.");

            return dto;
        }
        public async Task<List<UserNotificationDto>> GetForUserAsync(int userId)
        {
            return await databaseContext.UserNotifications
                .Where(item => item.IsActive && item.UserId == userId)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new UserNotificationDto
                {
                    Id = item.UserNotificationId,
                    UserId = item.UserId,
                    Title = item.Title,
                    Body = item.Body,
                    IsRead = item.IsRead,
                    CreatedAt = item.CreatedAt,
                    IsActive = item.IsActive,
                    SupportTicketId = item.SupportTicketId,
                    SupportMessageId = item.SupportMessageId
                })
                .ToListAsync();
        }
    }
}
