using Data.Dtos.Announcement;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class AnnouncementService : BaseService, IAnnouncementService
    {
        public AnnouncementService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(AnnouncementCreateDto dto, int createdByUserId)
        {
            Announcement announcement = new()
            {
                Title = dto.Title!,
                Body = dto.Body!,
                IsPublished = dto.IsPublished,
                PublishAt = dto.PublishAt,
                ExpiresAt = dto.ExpiresAt,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
                IsActive = true
            };

            databaseContext.Announcements.Add(announcement);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(AnnouncementEditDto dto)
        {
            Announcement announcement = databaseContext.Announcements
                .FirstOrDefault(item => item.AnnouncementId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego ogłoszenia o id {dto.Id}.");

            announcement.Title = dto.Title!;
            announcement.Body = dto.Body!;
            announcement.IsPublished = dto.IsPublished;
            announcement.PublishAt = dto.PublishAt;
            announcement.ExpiresAt = dto.ExpiresAt;

            announcement.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            Announcement announcement = databaseContext.Announcements
                .FirstOrDefault(item => item.AnnouncementId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego ogłoszenia o id {id}.");

            announcement.IsActive = false;
            announcement.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<AnnouncementDto>> GetAllAsync(bool includeAll = false)
        {
            DateTime now = DateTime.UtcNow;

            IQueryable<Announcement> query = databaseContext.Announcements
                .Where(item => item.IsActive);

            if (!includeAll)
            {
                query = query.Where(item =>
                    item.IsPublished &&
                    (item.PublishAt == null || item.PublishAt <= now) &&
                    (item.ExpiresAt == null || item.ExpiresAt > now)
                );
            }

            return await query
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new AnnouncementDto
                {
                    Id = item.AnnouncementId,
                    Title = item.Title,
                    Body = item.Body,
                    IsPublished = item.IsPublished,
                    PublishAt = item.PublishAt,
                    ExpiresAt = item.ExpiresAt,
                    CreatedByUserId = item.CreatedByUserId,
                    UserName = item.CreatedByUser!.UserProfile!.DisplayName!,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();
        }

        public async Task<AnnouncementDto> GetAsync(int id)
        {
            AnnouncementDto dto = await databaseContext.Announcements
                .Where(item => item.IsActive && item.AnnouncementId == id)
                .Select(item => new AnnouncementDto()
                {
                    Id = item.AnnouncementId,
                    Title = item.Title,
                    Body = item.Body,
                    IsPublished = item.IsPublished,
                    PublishAt = item.PublishAt,
                    ExpiresAt = item.ExpiresAt,
                    CreatedByUserId = item.CreatedByUserId,
                    UserName = item.CreatedByUser!.UserProfile!.DisplayName!,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego ogłoszenia o id {id}.");

            return dto;
        }
    }
}
