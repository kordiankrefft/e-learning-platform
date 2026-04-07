using Data.Dtos.UserCourseAccess;

namespace Elearning.API.Services.Interfaces
{
    public interface IUserCourseAccessService
    {
        Task CreateAsync(UserCourseAccessCreateDto dto, int userId);
        Task EditAsync(UserCourseAccessEditDto dto);
        Task DeleteAsync(int id);
        Task<List<UserCourseAccessDto>> GetAllAsync();
        Task<UserCourseAccessDto> GetAsync(int id);
        Task<List<UserCourseAccessDto>> GetMyAsync(int userId);

        Task<bool> StudentHasAccessToCourseAsync(int userId, int courseId);
    }
}
