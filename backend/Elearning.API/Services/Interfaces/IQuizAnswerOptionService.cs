using Data.Dtos.QuizAnswerOption;

namespace Elearning.API.Services.Interfaces
{
    public interface IQuizAnswerOptionService
    {
        Task CreateAsync(QuizAnswerOptionCreateDto dto);
        Task EditAsync(QuizAnswerOptionEditDto dto);
        Task DeleteAsync(int id);
        Task<List<QuizAnswerOptionDto>> GetAllAsync();
        Task<QuizAnswerOptionDto> GetAsync(int id);

        Task<(int? courseId, int? tutorUserId)> GetOptionCourseInfoAsync(int optionId);
        Task<List<QuizAnswerOptionDto>> GetAllForTutorAsync(int tutorUserId);
    }
}
