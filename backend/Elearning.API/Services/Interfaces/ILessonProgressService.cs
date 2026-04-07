using Data.Dtos.LessonProgress;

namespace Elearning.API.Services.Interfaces
{
    public interface ILessonProgressService
    {
        Task CreateAsync(LessonProgressCreateDto dto, int userId);
        Task DeleteAsync(int id);
        Task<List<LessonProgressDto>> GetAllAsync();
        Task<LessonProgressDto> GetAsync(int id);

        Task<List<LessonProgressDto>> GetAllForUserAsync(int userId);
        Task<List<LessonProgressDto>> GetAllForTutorAsync(int tutorUserId);

        Task<int?> GetCourseIdForLessonAsync(int lessonId);

        Task<(int UserId, int CourseId, int TutorUserId)?> GetProgressAccessInfoAsync(int lessonProgressId);
    }
}
