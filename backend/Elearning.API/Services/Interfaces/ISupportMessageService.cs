using Data.Dtos.SupportMessage;

namespace Elearning.API.Services.Interfaces
{
    public interface ISupportMessageService
    {
        Task CreateAsync(SupportMessageCreateDto dto, int fromUserId);
        Task DeleteAsync(int id);
        Task<List<SupportMessageDto>> GetAllAsync();
        Task<SupportMessageDto> GetAsync(int id);
        Task<List<SupportMessageDto>> GetForTicketAsync(int ticketId);
    }
}
