using Data.Dtos.Announcement;

namespace Elearning.API.Services.Interfaces
{
    public interface IAnnouncementService
    {
        Task CreateAsync(AnnouncementCreateDto dto, int createdByUserId);
        Task EditAsync(AnnouncementEditDto dto);
        Task DeleteAsync(int id);
        Task<List<AnnouncementDto>> GetAllAsync(bool includeAll = false);
        Task<AnnouncementDto> GetAsync(int id);
    }
}
