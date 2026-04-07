using Data.Dtos.QuizQuestion;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class QuizQuestionService : BaseService, IQuizQuestionService
    {
        public QuizQuestionService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(QuizQuestionCreateDto dto)
        {
            QuizQuestion question = new()
            {
                QuizId = dto.QuizId,
                QuestionText = dto.QuestionText!,
                QuestionType = dto.QuestionType!,
                Points = dto.Points,
                OrderIndex = dto.OrderIndex,
                IsActive = true
            };

            databaseContext.QuizQuestions.Add(question);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(QuizQuestionEditDto dto)
        {
            QuizQuestion question = databaseContext.QuizQuestions
                .FirstOrDefault(item => item.QuizQuestionId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego pytania quizu o id {dto.Id}.");

            question.QuizId = dto.QuizId;
            question.QuestionText = dto.QuestionText!;
            question.QuestionType = dto.QuestionType!;
            question.Points = dto.Points;
            question.OrderIndex = dto.OrderIndex;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            QuizQuestion question = databaseContext.QuizQuestions
                .FirstOrDefault(item => item.QuizQuestionId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego pytania quizu o id {id}.");

            question.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<QuizQuestionDto>> GetAllAsync()
        {
            List<QuizQuestionDto> dtos = await databaseContext.QuizQuestions
                .Where(item => item.IsActive)
                .OrderBy(item => item.QuizId)
                .ThenBy(item => item.OrderIndex)
                .Select(item => new QuizQuestionDto()
                {
                    Id = item.QuizQuestionId,
                    QuizId = item.QuizId,
                    QuizTitle = item.Quiz.Title,
                    QuestionText = item.QuestionText,
                    QuestionType = item.QuestionType,
                    Points = item.Points,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<QuizQuestionDto> GetAsync(int id)
        {
            QuizQuestionDto dto = await databaseContext.QuizQuestions
                .Where(item => item.IsActive && item.QuizQuestionId == id)
                .Select(item => new QuizQuestionDto()
                {
                    Id = item.QuizQuestionId,
                    QuizId = item.QuizId,
                    QuizTitle = item.Quiz.Title,
                    QuestionText = item.QuestionText,
                    QuestionType = item.QuestionType,
                    Points = item.Points,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego pytania quizu o id {id}.");

            return dto;
        }

        // pomocniczo, courseId + TutorUserId na podstawie ID pytania
        public async Task<(int? courseId, int? tutorUserId)> GetQuestionCourseInfoAsync(int questionId)
        {
            var info = await databaseContext.QuizQuestions
                .Where(q => q.QuizQuestionId == questionId && q.IsActive)
                .Select(q => new
                {
                    LessonCourseId = q.Quiz.Lesson != null ? (int?)q.Quiz.Lesson.Module.CourseId : null,
                    ModuleCourseId = q.Quiz.Module != null ? (int?)q.Quiz.Module.CourseId : null,
                    LessonTutorId = q.Quiz.Lesson != null ? (int?)q.Quiz.Lesson.Module.Course.TutorUserId : null,
                    ModuleTutorId = q.Quiz.Module != null ? (int?)q.Quiz.Module.Course.TutorUserId : null
                })
                .FirstOrDefaultAsync();

            if (info == null)
                return (null, null);

            int? courseId = info.LessonCourseId ?? info.ModuleCourseId;
            int? tutorUserId = info.LessonTutorId ?? info.ModuleTutorId;

            return (courseId, tutorUserId);
        }

        // Zwraca CourseId i TutorUserId dla quizu — niezależnie czy quiz jest przypisany do lekcji czy modułu.
        public async Task<(int? CourseId, int? TutorUserId)> GetCourseInfoForQuizAsync(int quizId)
        {
            var quizInfo = await databaseContext.Quizzes
                .Where(item => item.QuizId == quizId && item.IsActive)
                .Select(item => new
                {
                    LessonCourseId = item.Lesson != null
                        ? (int?)item.Lesson.Module.CourseId
                        : null,
                    ModuleCourseId = item.Module != null
                        ? (int?)item.Module.CourseId
                        : null,
                    LessonTutorId = item.Lesson != null
                        ? (int?)item.Lesson.Module.Course.TutorUserId
                        : null,
                    ModuleTutorId = item.Module != null
                        ? (int?)item.Module.Course.TutorUserId
                        : null
                })
                .FirstOrDefaultAsync();

            if (quizInfo == null)
                return (null, null);

            int? courseId = quizInfo.LessonCourseId ?? quizInfo.ModuleCourseId;
            int? tutorUserId = quizInfo.LessonTutorId ?? quizInfo.ModuleTutorId;

            return (courseId, tutorUserId);
        }

        public async Task<List<QuizQuestionDto>> GetAllForTutorAsync(int tutorUserId)
        {
            List<QuizQuestionDto> dtos = await databaseContext.QuizQuestions
                .Where(item =>
                    item.IsActive &&
                    (
                        (item.Quiz.Lesson != null &&
                         item.Quiz.Lesson.Module.Course.TutorUserId == tutorUserId)
                        ||
                        (item.Quiz.Module != null &&
                         item.Quiz.Module.Course.TutorUserId == tutorUserId)
                    )
                )
                .OrderBy(item => item.QuizId)
                .ThenBy(item => item.OrderIndex)
                .Select(item => new QuizQuestionDto()
                {
                    Id = item.QuizQuestionId,
                    QuizId = item.QuizId,
                    QuizTitle = item.Quiz.Title,
                    QuestionText = item.QuestionText,
                    QuestionType = item.QuestionType,
                    Points = item.Points,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }
    }
}
