using Data.Dtos.UserCourseEnrollment;

namespace Elearning.API.Services.Interfaces
{
    public interface IUserCourseEnrollmentService
    {
        Task CreateAsync(UserCourseEnrollmentCreateDto dto, int userId);
        Task EditAsync(UserCourseEnrollmentEditDto dto);
        Task DeleteAsync(int id);
        Task<List<UserCourseEnrollmentDto>> GetAllAsync();
        Task<UserCourseEnrollmentDto> GetAsync(int id);

        Task MarkCompletedAsync(int id);
        Task<List<UserCourseEnrollmentDto>> GetMyAsync(int userId);
    }
}
