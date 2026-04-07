using Data.Dtos.Quiz;
using Data.Dtos.QuizTake;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class QuizService : BaseService, IQuizService
    {
        public QuizService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(QuizCreateDto dto)
        {
            Quiz item = new()
            {
                LessonId = dto.LessonId,
                ModuleId = dto.ModuleId,
                Title = dto.Title!,
                Description = dto.Description,
                TimeLimitSeconds = dto.TimeLimitSeconds,
                PassThresholdPct = dto.PassThresholdPct,
                MaxAttempts = dto.MaxAttempts,
                IsActive = true
            };

            databaseContext.Quizzes.Add(item);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(QuizEditDto dto)
        {
            Quiz item = databaseContext.Quizzes
                .FirstOrDefault(item => item.QuizId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego quizu o id {dto.Id}.");

            item.LessonId = dto.LessonId;
            item.ModuleId = dto.ModuleId;
            item.Title = dto.Title!;
            item.Description = dto.Description;
            item.TimeLimitSeconds = dto.TimeLimitSeconds;
            item.PassThresholdPct = dto.PassThresholdPct;
            item.MaxAttempts = dto.MaxAttempts;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            Quiz item = databaseContext.Quizzes
                .FirstOrDefault(item => item.QuizId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego quizu o id {id}.");

            item.IsActive = false;
            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<QuizDto>> GetAllAsync()
        {
            return await databaseContext.Quizzes
                .Where(item => item.IsActive)
                .Select(item => new QuizDto
                {
                    Id = item.QuizId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson!.Title,
                    ModuleId = item.ModuleId,
                    ModuleTitle = item.Module!.Title,
                    Title = item.Title,
                    Description = item.Description,
                    TimeLimitSeconds = item.TimeLimitSeconds,
                    PassThresholdPct = item.PassThresholdPct,
                    MaxAttempts = item.MaxAttempts,
                    IsActive = item.IsActive
                })
                .ToListAsync();
        }

        public async Task<QuizDto> GetAsync(int id)
        {
            QuizDto dto = await databaseContext.Quizzes
                .Where(item => item.IsActive && item.QuizId == id)
                .Select(item => new QuizDto
                {
                    Id = item.QuizId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson!.Title,
                    ModuleId = item.ModuleId,
                    ModuleTitle = item.Module!.Title,
                    Title = item.Title,
                    Description = item.Description,
                    TimeLimitSeconds = item.TimeLimitSeconds,
                    PassThresholdPct = item.PassThresholdPct,
                    MaxAttempts = item.MaxAttempts,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego quizu o id {id}.");

            return dto;
        }

        // do kontroli dostępu (Tutor / Student)
        public async Task<(int? courseId, int? tutorUserId)> GetQuizCourseInfoAsync(int quizId)
        {
            var info = await databaseContext.Quizzes
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

            if (info == null)
                return (null, null);

            int? courseId = info.LessonCourseId ?? info.ModuleCourseId;
            int? tutorUserId = info.LessonTutorId ?? info.ModuleTutorId;

            return (courseId, tutorUserId);
        }

        // Tutor: tylko quizy z jego kursów
        public async Task<List<QuizDto>> GetAllForTutorAsync(int tutorUserId)
        {
            return await databaseContext.Quizzes
                .Where(item =>
                    item.IsActive &&
                    (
                        (item.Lesson != null &&
                         item.Lesson.IsActive &&
                         item.Lesson.Module.IsActive &&
                         item.Lesson.Module.Course.IsActive &&
                         item.Lesson.Module.Course.TutorUserId == tutorUserId)
                        ||
                        (item.Module != null &&
                         item.Module.IsActive &&
                         item.Module.Course.IsActive &&
                         item.Module.Course.TutorUserId == tutorUserId)
                    )
                )
                .Select(item => new QuizDto
                {
                    Id = item.QuizId,
                    LessonId = item.LessonId,
                    ModuleId = item.ModuleId,
                    Title = item.Title,
                    Description = item.Description,
                    TimeLimitSeconds = item.TimeLimitSeconds,
                    PassThresholdPct = item.PassThresholdPct,
                    MaxAttempts = item.MaxAttempts,
                    IsActive = item.IsActive
                })
                .ToListAsync();
        }

        // student, tylko quizy z kursów, do których ma AKTYWNY dostęp
        public async Task<List<QuizDto>> GetAllForStudentAsync(int studentUserId)
        {
            DateTime now = DateTime.UtcNow;

            var allowedCourseIds = databaseContext.UserCourseAccesses
                .Where(accessItem =>
                    accessItem.IsActive &&
                    accessItem.UserId == studentUserId &&
                    !accessItem.IsRevoked &&
                    accessItem.AccessStart <= now &&
                    (accessItem.AccessEnd == null || accessItem.AccessEnd >= now) &&
                    accessItem.Course.IsActive
                )
                .Select(accessItem => accessItem.CourseId);

            return await databaseContext.Quizzes
                .Where(item =>
                    item.IsActive &&
                    (
                        (item.Lesson != null &&
                         item.Lesson.IsActive &&
                         item.Lesson.Module.IsActive &&
                         item.Lesson.Module.Course.IsActive &&
                         allowedCourseIds.Contains(item.Lesson.Module.CourseId))
                        ||
                        (item.Module != null &&
                         item.Module.IsActive &&
                         item.Module.Course.IsActive &&
                         allowedCourseIds.Contains(item.Module.CourseId))
                    )
                )
                .Select(item => new QuizDto
                {
                    Id = item.QuizId,
                    LessonId = item.LessonId,
                    ModuleId = item.ModuleId,
                    Title = item.Title,
                    Description = item.Description,
                    TimeLimitSeconds = item.TimeLimitSeconds,
                    PassThresholdPct = item.PassThresholdPct,
                    MaxAttempts = item.MaxAttempts,
                    IsActive = item.IsActive
                })
                .ToListAsync();
        }

        // 1 quiz na moduł
        public async Task<QuizDto?> GetModuleQuizAsync(int moduleId)
        {
            return await databaseContext.Quizzes
                .Where(item => item.IsActive && item.ModuleId == moduleId)
                .Select(item => new QuizDto
                {
                    Id = item.QuizId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson!.Title,
                    ModuleId = item.ModuleId,
                    ModuleTitle = item.Module!.Title,
                    Title = item.Title,
                    Description = item.Description,
                    TimeLimitSeconds = item.TimeLimitSeconds,
                    PassThresholdPct = item.PassThresholdPct,
                    MaxAttempts = item.MaxAttempts,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync();
        }

        // QuizTake (questions + options BEZ isCorrect)
        public async Task<QuizTakeDto?> GetQuizTakeAsync(int quizId)
        {
            var quizInfo = await databaseContext.Quizzes
                .Where(item => item.QuizId == quizId && item.IsActive)
                .Select(item => new
                {
                    item.QuizId,
                    item.Title,
                    item.Description,
                    item.PassThresholdPct,
                    item.MaxAttempts,
                    item.TimeLimitSeconds
                })
                .FirstOrDefaultAsync();

            if (quizInfo == null)
                return null;

            var questions = await databaseContext.QuizQuestions
                .Where(questionItem => questionItem.IsActive && questionItem.QuizId == quizId)
                .OrderBy(questionItem => questionItem.OrderIndex)
                .Select(questionItem => new QuizTakeQuestionDto
                {
                    Id = questionItem.QuizQuestionId,
                    QuestionText = questionItem.QuestionText,
                    QuestionType = questionItem.QuestionType,
                    Points = questionItem.Points,
                    OrderIndex = questionItem.OrderIndex,

                    Options = databaseContext.QuizAnswerOptions
                        .Where(optionItem => optionItem.IsActive && optionItem.QuizQuestionId == questionItem.QuizQuestionId)
                        .OrderBy(optionItem => optionItem.OrderIndex)
                        .Select(optionItem => new QuizTakeAnswerOptionDto
                        {
                            Id = optionItem.QuizAnswerOptionId,
                            AnswerText = optionItem.AnswerText,
                            OrderIndex = optionItem.OrderIndex
                        })
                        .ToList()
                })
                .ToListAsync();

            return new QuizTakeDto
            {
                QuizId = quizInfo.QuizId,
                Title = quizInfo.Title,
                Description = quizInfo.Description,
                PassThresholdPct = quizInfo.PassThresholdPct,
                MaxAttempts = quizInfo.MaxAttempts,
                TimeLimitSeconds = quizInfo.TimeLimitSeconds,
                Questions = questions
            };
        }
    }
}
