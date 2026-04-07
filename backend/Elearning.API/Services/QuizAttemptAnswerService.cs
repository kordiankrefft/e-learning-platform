using Data.Dtos.QuizAttemptAnswer;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class QuizAttemptAnswerService : BaseService, IQuizAttemptAnswerService
    {
        public QuizAttemptAnswerService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(QuizAttemptAnswerCreateDto dto, int quizAttemptId)
        {
            QuizAttempt attempt = databaseContext.QuizAttempts
                .FirstOrDefault(item => item.QuizAttemptId == quizAttemptId && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego podejścia do quizu o id {quizAttemptId}.");

            QuizQuestion question = databaseContext.QuizQuestions
                .FirstOrDefault(item => item.QuizQuestionId == dto.QuizQuestionId && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego pytania o id {dto.QuizQuestionId}.");

            if (question.QuizId != attempt.QuizId)
                throw new Exception("Pytanie nie należy do tego samego quizu co podejście.");

            if (dto.SelectedOptionId.HasValue)
            {
                QuizAnswerOption option = databaseContext.QuizAnswerOptions
                    .FirstOrDefault(item => item.QuizAnswerOptionId == dto.SelectedOptionId.Value && item.IsActive)
                    ?? throw new Exception($"Nie odnaleziono aktywnej opcji odpowiedzi o id {dto.SelectedOptionId.Value}.");

                if (option.QuizQuestionId != question.QuizQuestionId)
                    throw new Exception("Wybrana opcja nie należy do tego pytania.");
            }

            QuizAttemptAnswer answer = new()
            {
                QuizAttemptId = quizAttemptId,
                QuizQuestionId = dto.QuizQuestionId,
                SelectedOptionId = dto.SelectedOptionId,
                OpenAnswerText = dto.OpenAnswerText,
                IsMarkedCorrect = null,
                IsActive = true
            };

            databaseContext.QuizAttemptAnswers.Add(answer);
            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            QuizAttemptAnswer answer = databaseContext.QuizAttemptAnswers
                .FirstOrDefault(item => item.QuizAttemptAnswerId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnej odpowiedzi podejścia do quizu o id {id}.");

            answer.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<QuizAttemptAnswerDto>> GetAllAsync()
        {
            List<QuizAttemptAnswerDto> dtos = await databaseContext.QuizAttemptAnswers
                .Where(item => item.IsActive)
                .OrderBy(item => item.QuizAttemptId)
                .ThenBy(item => item.QuizQuestionId)
                .Select(item => new QuizAttemptAnswerDto()
                {
                    Id = item.QuizAttemptAnswerId,
                    QuizAttemptId = item.QuizAttemptId,
                    QuizQuestionId = item.QuizQuestionId,
                    QuizQuestionText = item.QuizQuestion.QuestionText,
                    SelectedOptionId = item.SelectedOptionId,
                    SelectedOptionText = item.SelectedOption != null ? item.SelectedOption.AnswerText : null,
                    OpenAnswerText = item.OpenAnswerText,
                    IsMarkedCorrect = item.IsMarkedCorrect,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<QuizAttemptAnswerDto> GetAsync(int id)
        {
            QuizAttemptAnswerDto dto = await databaseContext.QuizAttemptAnswers
                .Where(item => item.IsActive && item.QuizAttemptAnswerId == id)
                .Select(item => new QuizAttemptAnswerDto()
                {
                    Id = item.QuizAttemptAnswerId,
                    QuizAttemptId = item.QuizAttemptId,
                    QuizQuestionId = item.QuizQuestionId,
                    QuizQuestionText = item.QuizQuestion.QuestionText,
                    SelectedOptionId = item.SelectedOptionId,
                    SelectedOptionText = item.SelectedOption != null ? item.SelectedOption.AnswerText : null,
                    OpenAnswerText = item.OpenAnswerText,
                    IsMarkedCorrect = item.IsMarkedCorrect,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnej odpowiedzi podejścia do quizu o id {id}.");

            return dto;
        }

        // pomocniczo, kurs + właściciel podejścia + tutor na podstawie ID odpowiedzi
        public async Task<(int? courseId, int attemptUserId, int? tutorUserId)> GetAnswerCourseInfoAsync(int answerId)
        {
            var info = await databaseContext.QuizAttemptAnswers
        .Where(item => item.QuizAttemptAnswerId == answerId && item.IsActive)
        .Select(item => new
        {
            item.QuizAttemptId,
            AttemptUserId = item.QuizAttempt.UserId,

            LessonCourseId = item.QuizAttempt.Quiz.Lesson != null
                ? (int?)item.QuizAttempt.Quiz.Lesson.Module.CourseId
                : null,
            ModuleCourseId = item.QuizAttempt.Quiz.Module != null
                ? (int?)item.QuizAttempt.Quiz.Module.CourseId
                : null,

            LessonTutorId = item.QuizAttempt.Quiz.Lesson != null
                ? (int?)item.QuizAttempt.Quiz.Lesson.Module.Course.TutorUserId
                : null,
            ModuleTutorId = item.QuizAttempt.Quiz.Module != null
                ? (int?)item.QuizAttempt.Quiz.Module.Course.TutorUserId
                : null
        })
        .FirstOrDefaultAsync();

            if (info == null)
                return (null, 0, null);

            int? courseId = info.LessonCourseId ?? info.ModuleCourseId;
            int? tutorUserId = info.LessonTutorId ?? info.ModuleTutorId;

            return (courseId, info.AttemptUserId, tutorUserId);
        }
    }
}
