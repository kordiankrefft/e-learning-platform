using Data.Dtos.QuizAttemptAnswer;

namespace Elearning.API.Services.Interfaces
{
    public interface IQuizAttemptAnswerService
    {
        Task CreateAsync(QuizAttemptAnswerCreateDto dto, int quizAttemptId);
        Task DeleteAsync(int id);
        Task<List<QuizAttemptAnswerDto>> GetAllAsync();
        Task<QuizAttemptAnswerDto> GetAsync(int id);

        Task<(int? courseId, int attemptUserId, int? tutorUserId)> GetAnswerCourseInfoAsync(int answerId);
    }
}
