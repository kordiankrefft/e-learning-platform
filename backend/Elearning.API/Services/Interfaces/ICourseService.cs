using Data.Dtos.Course;

namespace Elearning.API.Services.Interfaces
{
    public interface ICourseService
    {
        Task CreateAsync(CourseCreateDto dto, int tutorUserId);
        Task EditAsync(CourseEditDto dto);
        Task DeleteAsync(int id);
        Task<List<CourseDto>> GetAllAsync();
        Task<CourseDto> GetAsync(int id);

        Task<List<CourseDto>> GetAllForTutorAsync(int tutorUserId);
    }
}
