using Data.Dtos.QuizAnswerOption;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class QuizAnswerOptionService : BaseService, IQuizAnswerOptionService
    {
        public QuizAnswerOptionService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(QuizAnswerOptionCreateDto dto)
        {
            QuizAnswerOption option = new()
            {
                QuizQuestionId = dto.QuizQuestionId,
                AnswerText = dto.AnswerText!,
                IsCorrect = dto.IsCorrect,
                OrderIndex = dto.OrderIndex,
                IsActive = true
            };

            databaseContext.QuizAnswerOptions.Add(option);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(QuizAnswerOptionEditDto dto)
        {
            QuizAnswerOption option = databaseContext.QuizAnswerOptions
                .FirstOrDefault(item => item.QuizAnswerOptionId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnej odpowiedzi quizu o id {dto.Id}.");

            option.QuizQuestionId = dto.QuizQuestionId;
            option.AnswerText = dto.AnswerText!;
            option.IsCorrect = dto.IsCorrect;
            option.OrderIndex = dto.OrderIndex;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            QuizAnswerOption option = databaseContext.QuizAnswerOptions
                .FirstOrDefault(item => item.QuizAnswerOptionId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnej odpowiedzi quizu o id {id}.");

            option.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<QuizAnswerOptionDto>> GetAllAsync()
        {
            List<QuizAnswerOptionDto> dtos = await databaseContext.QuizAnswerOptions
                .Where(item => item.IsActive)
                .OrderBy(item => item.QuizQuestionId)
                .ThenBy(item => item.OrderIndex)
                .Select(item => new QuizAnswerOptionDto()
                {
                    Id = item.QuizAnswerOptionId,
                    QuizQuestionId = item.QuizQuestionId,
                    QuizQuestionText = item.QuizQuestion.QuestionText,
                    AnswerText = item.AnswerText,
                    IsCorrect = item.IsCorrect,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<QuizAnswerOptionDto> GetAsync(int id)
        {
            QuizAnswerOptionDto dto = await databaseContext.QuizAnswerOptions
                .Where(item => item.IsActive && item.QuizAnswerOptionId == id)
                .Select(item => new QuizAnswerOptionDto()
                {
                    Id = item.QuizAnswerOptionId,
                    QuizQuestionId = item.QuizQuestionId,
                    QuizQuestionText = item.QuizQuestion.QuestionText,
                    AnswerText = item.AnswerText,
                    IsCorrect = item.IsCorrect,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnej odpowiedzi quizu o id {id}.");

            return dto;
        }

        public async Task<List<QuizAnswerOptionDto>> GetAllForTutorAsync(int tutorUserId)
        {
            var dtos = await databaseContext.QuizAnswerOptions
                .Where(item =>
                    item.IsActive &&
                    (
                        (item.QuizQuestion!.Quiz.Lesson != null &&
                         item.QuizQuestion!.Quiz.Lesson.Module.Course.TutorUserId == tutorUserId)
                        ||
                        (item.QuizQuestion!.Quiz.Module != null &&
                         item.QuizQuestion.Quiz.Module.Course.TutorUserId == tutorUserId)
                    )
                )
                .OrderBy(item => item.QuizQuestionId)
                .ThenBy(item => item.OrderIndex)
                .Select(item => new QuizAnswerOptionDto()
                {
                    Id = item.QuizAnswerOptionId,
                    QuizQuestionId = item.QuizQuestionId,
                    QuizQuestionText = item.QuizQuestion.QuestionText,
                    AnswerText = item.AnswerText,
                    IsCorrect = item.IsCorrect,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }



        // pomocniczo, wyciągnięcie CourseId + TutorUserId na podstawie ID opcji odpowiedzi
        public async Task<(int? courseId, int? tutorUserId)> GetOptionCourseInfoAsync(int optionId)
        {
            var info = await databaseContext.QuizAnswerOptions
        .Where(item => item.QuizAnswerOptionId == optionId && item.IsActive)
        .Select(item => new
        {
            LessonCourseId = item.QuizQuestion.Quiz.Lesson != null
                ? (int?)item.QuizQuestion.Quiz.Lesson.Module.CourseId
                : null,
            ModuleCourseId = item.QuizQuestion.Quiz.Module != null
                ? (int?)item.QuizQuestion.Quiz.Module.CourseId
                : null,
            LessonTutorId = item.QuizQuestion.Quiz.Lesson != null
                ? (int?)item.QuizQuestion.Quiz.Lesson.Module.Course.TutorUserId
                : null,
            ModuleTutorId = item.QuizQuestion.Quiz.Module != null
                ? (int?)item.QuizQuestion.Quiz.Module.Course.TutorUserId
                : null
        })
        .FirstOrDefaultAsync();

            if (info == null)
                return (null, null);

            int? courseId = info.LessonCourseId ?? info.ModuleCourseId;
            int? tutorUserId = info.LessonTutorId ?? info.ModuleTutorId;

            return (courseId, tutorUserId);
        }
    }
}
