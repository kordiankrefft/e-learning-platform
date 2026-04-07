using Data.Dtos.LessonAttachment;

namespace Elearning.API.Services.Interfaces
{
    public interface ILessonAttachmentService
    {
        Task CreateAsync(LessonAttachmentCreateDto dto);
        Task EditAsync(LessonAttachmentEditDto dto);
        Task DeleteAsync(int id);
        Task<List<LessonAttachmentDto>> GetAllAsync();
        Task<LessonAttachmentDto> GetAsync(int id);

        Task<List<LessonAttachmentDto>> GetAllForLessonAsync(int lessonId);

        Task<(int CourseId, int TutorUserId)?> GetCourseInfoForLessonAsync(int lessonId);
        Task<(int CourseId, int TutorUserId)?> GetCourseInfoForAttachmentAsync(int attachmentId);
    }
}
