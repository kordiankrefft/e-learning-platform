using Data.Dtos.Quiz;

namespace Elearning.API.Services.Interfaces
{
    public interface IQuizService
    {
        Task CreateAsync(QuizCreateDto dto);
        Task EditAsync(QuizEditDto dto);
        Task DeleteAsync(int id);
        Task<List<QuizDto>> GetAllAsync();
        Task<QuizDto> GetAsync(int id);

        Task<List<QuizDto>> GetAllForTutorAsync(int tutorUserId);
        Task<List<QuizDto>> GetAllForStudentAsync(int studentUserId);

        Task<(int? courseId, int? tutorUserId)> GetQuizCourseInfoAsync(int quizId);

        Task<QuizDto?> GetModuleQuizAsync(int moduleId);
        Task<QuizTakeDto?> GetQuizTakeAsync(int quizId);
    }
}
