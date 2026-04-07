using Data.Dtos.UserNotification;

namespace Elearning.API.Services.Interfaces
{
    public interface IUserNotificationService
    {
        Task CreateSupportAsync(UserNotificationSupportCreateDto dto);
        Task EditAsync(UserNotificationEditDto dto);
        Task DeleteAsync(int id);
        Task<List<UserNotificationDto>> GetAllAsync();
        Task<UserNotificationDto> GetAsync(int id);

        Task<List<UserNotificationDto>> GetForUserAsync(int userId);
    }
}
