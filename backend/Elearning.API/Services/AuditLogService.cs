using Data.Dtos.AuditLog;
using Data.Dtos.Common;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class AuditLogService : BaseService, IAuditLogService
    {
        public AuditLogService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }
        public async Task<PagedSlice<AuditLogDto>> GetPagedSliceAsync(int page, int pageSize)
        {
            page = page < 1 ? 1 : page;

            pageSize = pageSize < 1 ? 20 : pageSize;
            pageSize = pageSize > 200 ? 200 : pageSize; 

            var query = databaseContext.AuditLogs
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.CreatedAt);

            var totalCount = await query.CountAsync();

            var list = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .Select(item => new AuditLogDto
                {
                    Id = item.AuditLogId,
                    UserId = item.UserId,
                    UserName = item.User!.UserProfile!.DisplayName!,
                    ActionType = item.ActionType,
                    EntityName = item.EntityName,
                    EntityId = item.EntityId,
                    Details = item.Details,
                    CreatedAt = item.CreatedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            var hasNext = list.Count > pageSize;
            if (hasNext) list.RemoveAt(list.Count - 1);

            return new PagedSlice<AuditLogDto>
            {
                Items = list,
                Page = page,
                PageSize = pageSize,
                HasNext = hasNext,
                TotalCount = totalCount
            };
        }

        public async Task CreateAsync(AuditLogCreateDto dto)
        {
            AuditLog log = new()
            {
                UserId = dto.UserId,
                ActionType = dto.ActionType,
                EntityName = dto.EntityName,
                EntityId = dto.EntityId,
                Details = dto.Details,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            databaseContext.AuditLogs.Add(log);
            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            AuditLog log = databaseContext.AuditLogs
                .FirstOrDefault(item => item.AuditLogId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego logu audytu o id {id}.");

            log.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<AuditLogDto>> GetAllAsync()
        {
            List<AuditLogDto> dtos = await databaseContext.AuditLogs
                .Where(item => item.IsActive)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new AuditLogDto()
                {
                    Id = item.AuditLogId,
                    UserId = item.UserId,
                    UserName = item.User!.UserProfile!.DisplayName!,
                    ActionType = item.ActionType,
                    EntityName = item.EntityName,
                    EntityId = item.EntityId,
                    Details = item.Details,
                    CreatedAt = item.CreatedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<AuditLogDto> GetAsync(int id)
        {
            AuditLogDto dto = await databaseContext.AuditLogs
                .Where(item => item.IsActive && item.AuditLogId == id)
                .Select(item => new AuditLogDto()
                {
                    Id = item.AuditLogId,
                    UserId = item.UserId,
                    UserName = item.User!.UserProfile!.DisplayName!,
                    ActionType = item.ActionType,
                    EntityName = item.EntityName,
                    EntityId = item.EntityId,
                    Details = item.Details,
                    CreatedAt = item.CreatedAt,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego logu audytu o id {id}.");

            return dto;
        }
    }
}
