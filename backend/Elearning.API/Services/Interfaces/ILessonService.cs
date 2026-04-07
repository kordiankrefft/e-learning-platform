using Data.Dtos.Lesson;

namespace Elearning.API.Services.Interfaces
{
    public interface ILessonService
    {
        Task CreateAsync(LessonCreateDto dto);
        Task EditAsync(LessonEditDto dto);
        Task DeleteAsync(int id);
        Task<List<LessonDto>> GetAllAsync();
        Task<LessonDto> GetAsync(int id);

        Task<LessonDto> GetForStudentAsync(int id, int userId);
        Task<List<LessonDto>> GetAllForModuleAsync(int moduleId);

        Task<(int CourseId, int TutorUserId)?> GetCourseInfoForModuleAsync(int moduleId);
        Task<(int CourseId, int TutorUserId)?> GetCourseInfoForLessonAsync(int lessonId);
    }
}
