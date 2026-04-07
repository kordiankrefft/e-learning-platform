using Data.Dtos.LessonContentBlock;

namespace Elearning.API.Services.Interfaces
{
    public interface ILessonContentBlockService
    {
        Task CreateAsync(LessonContentBlockCreateDto dto);
        Task EditAsync(LessonContentBlockEditDto dto);
        Task DeleteAsync(int id);
        Task<List<LessonContentBlockDto>> GetAllAsync();
        Task<LessonContentBlockDto> GetAsync(int id);

        Task<List<LessonContentBlockDto>> GetAllForLessonAsync(int lessonId);

        Task<(int CourseId, int TutorUserId)?> GetCourseInfoForLessonAsync(int lessonId);
        Task<(int CourseId, int TutorUserId)?> GetCourseInfoForContentBlockAsync(int contentBlockId);
    }
}
