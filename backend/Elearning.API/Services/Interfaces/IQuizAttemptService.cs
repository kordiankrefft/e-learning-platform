using Data.Dtos.QuizAttempt;

namespace Elearning.API.Services.Interfaces
{
    public interface IQuizAttemptService
    {
        Task<int> CreateAsync(QuizAttemptCreateDto dto, int userId);
        Task EditAsync(QuizAttemptEditDto dto);
        Task DeleteAsync(int id);
        Task<List<QuizAttemptDto>> GetAllAsync();
        Task<QuizAttemptDto> GetAsync(int id);

        Task<(int? CourseId, int AttemptUserId, int? TutorUserId)> GetAttemptCourseInfoAsync(int attemptId);

        Task SubmitAndScoreAsync(int attemptId, int studentUserId);


    }
}
