using Data.Dtos.AuditLog;
using Data.Dtos.Common;

namespace Elearning.API.Services.Interfaces
{
    public interface IAuditLogService
    {
        Task CreateAsync(AuditLogCreateDto dto);
        Task DeleteAsync(int id);
        Task<List<AuditLogDto>> GetAllAsync();
        Task<AuditLogDto> GetAsync(int id);

        Task<PagedSlice<AuditLogDto>> GetPagedSliceAsync(int page, int pageSize);


    }
}
