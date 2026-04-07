using Data.Dtos.SupportTicket;

namespace Elearning.API.Services.Interfaces
{
    public interface ISupportTicketService
    {
        Task CreateAsync(SupportTicketCreateDto dto, int userId);
        Task EditAsync(SupportTicketEditDto dto);
        Task DeleteAsync(int id);
        Task<List<SupportTicketDto>> GetAllAsync();
        Task<SupportTicketDto> GetAsync(int id);

        Task<List<SupportTicketDto>> GetForStudentAsync(int userId);
        Task<List<SupportTicketDto>> GetForTutorAsync(int tutorUserId);
    }
}
