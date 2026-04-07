using Data.Dtos.QuizQuestion;

namespace Elearning.API.Services.Interfaces
{
    public interface IQuizQuestionService
    {
        Task CreateAsync(QuizQuestionCreateDto dto);
        Task EditAsync(QuizQuestionEditDto dto);
        Task DeleteAsync(int id);
        Task<List<QuizQuestionDto>> GetAllAsync();
        Task<QuizQuestionDto> GetAsync(int id);

        Task<(int? CourseId, int? TutorUserId)> GetCourseInfoForQuizAsync(int quizId);
        Task<(int? courseId, int? tutorUserId)> GetQuestionCourseInfoAsync(int questionId);
        Task<List<QuizQuestionDto>> GetAllForTutorAsync(int tutorUserId);
    }
}
