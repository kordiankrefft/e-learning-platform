using Data.Dtos.QuizAttempt;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class QuizAttemptService : BaseService, IQuizAttemptService
    {
        public QuizAttemptService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task<int> CreateAsync(QuizAttemptCreateDto dto, int userId)
        {
            var quizData = await databaseContext.Quizzes
                .Where(item => item.IsActive && item.QuizId == dto.QuizId)
                .Select(item => new
                {
                    item.QuizId,
                    item.MaxAttempts
                })
                .FirstOrDefaultAsync();

            if (quizData == null)
                throw new Exception("Nie znaleziono aktywnego quizu o podanym id.");

            //jeśli (SubmittedAt == null) nie twórz nowego, tylko zwróć istniejące
            int? existingOpenAttemptId = await databaseContext.QuizAttempts
                .Where(item =>
                    item.IsActive &&
                    item.QuizId == dto.QuizId &&
                    item.UserId == userId &&
                    item.SubmittedAt == null
                )
                .Select(item => (int?)item.QuizAttemptId)
                .FirstOrDefaultAsync();

            if (existingOpenAttemptId.HasValue)
                return existingOpenAttemptId.Value;

            //limit podejść (MaxAttempts) - licz tylko zakończone podejścia
            if (quizData.MaxAttempts.HasValue)
            {
                int finishedAttemptsCount = await databaseContext.QuizAttempts
                    .CountAsync(item =>
                        item.IsActive &&
                        item.QuizId == dto.QuizId &&
                        item.UserId == userId &&
                        item.SubmittedAt != null
                    );

                if (finishedAttemptsCount >= quizData.MaxAttempts.Value)
                    throw new Exception("Przekroczono limit podejść do tego quizu.");
            }

            QuizAttempt attempt = new()
            {
                QuizId = dto.QuizId,
                UserId = userId,
                IsActive = true,
                StartedAt = DateTime.UtcNow,
                SubmittedAt = null,
                ScoreTotal = null,
                ScorePercent = null,
                Passed = null
            };

            databaseContext.QuizAttempts.Add(attempt);
            await databaseContext.SaveChangesAsync();

            return attempt.QuizAttemptId;
        }


        public async Task EditAsync(QuizAttemptEditDto dto)
        {
            QuizAttempt attempt = databaseContext.QuizAttempts
                .FirstOrDefault(item => item.QuizAttemptId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego podejścia do quizu o id {dto.Id}.");

            attempt.SubmittedAt = dto.SubmittedAt;
            attempt.ScoreTotal = dto.ScoreTotal;
            attempt.ScorePercent = dto.ScorePercent;
            attempt.Passed = dto.Passed;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            QuizAttempt attempt = databaseContext.QuizAttempts
                .FirstOrDefault(item => item.QuizAttemptId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego podejścia do quizu o id {id}.");

            attempt.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<QuizAttemptDto>> GetAllAsync()
        {
            List<QuizAttemptDto> dtos = await databaseContext.QuizAttempts
                .Where(item => item.IsActive)
                .OrderByDescending(item => item.StartedAt)
                .Select(item => new QuizAttemptDto()
                {
                    Id = item.QuizAttemptId,
                    QuizId = item.QuizId,
                    QuizTitle = item.Quiz.Title,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,  
                    StartedAt = item.StartedAt,
                    SubmittedAt = item.SubmittedAt,
                    ScoreTotal = item.ScoreTotal,
                    ScorePercent = item.ScorePercent,
                    Passed = item.Passed,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<QuizAttemptDto> GetAsync(int id)
        {
            QuizAttemptDto dto = await databaseContext.QuizAttempts
                .Where(item => item.IsActive && item.QuizAttemptId == id)
                .Select(item => new QuizAttemptDto()
                {
                    Id = item.QuizAttemptId,
                    QuizId = item.QuizId,
                    QuizTitle = item.Quiz.Title,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    StartedAt = item.StartedAt,
                    SubmittedAt = item.SubmittedAt,
                    ScoreTotal = item.ScoreTotal,
                    ScorePercent = item.ScorePercent,
                    Passed = item.Passed,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego podejścia do quizu o id {id}.");

            return dto;
        }

        public async Task SubmitAndScoreAsync(int attemptId, int studentUserId)
        {
            QuizAttempt attempt = await databaseContext.QuizAttempts
                .FirstOrDefaultAsync(item => item.QuizAttemptId == attemptId && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego podejścia do quizu o id {attemptId}.");

            if (attempt.UserId != studentUserId)
                throw new Exception("To podejście nie należy do tego użytkownika.");

            if (attempt.SubmittedAt != null)
                throw new Exception("To podejście zostało już zakończone.");

            var quizInfo = await databaseContext.Quizzes
                .Where(item => item.QuizId == attempt.QuizId && item.IsActive)
                .Select(item => new
                {
                    item.PassThresholdPct
                })
                .FirstOrDefaultAsync();

            if (quizInfo == null)
                throw new Exception("Nie odnaleziono aktywnego quizu powiązanego z podejściem.");

            var questions = await databaseContext.QuizQuestions
                .Where(item => item.IsActive && item.QuizId == attempt.QuizId)
                .Select(item => new
                {
                    QuizQuestionId = item.QuizQuestionId,
                    Points = item.Points
                })
                .ToListAsync();

            if (questions.Count == 0)
                throw new Exception("Quiz nie ma pytań.");

            decimal scoreTotal = questions.Sum(item => item.Points);

            // Odpowiedzi studenta dla podejścia
            // (jeśli przypadkiem zapisze się więcej niż 1 rekord dla pytania, bierzemy pierwszy)
            var answersByQuestion = await databaseContext.QuizAttemptAnswers
                .Where(item => item.IsActive && item.QuizAttemptId == attemptId)
                .GroupBy(item => item.QuizQuestionId)
                .Select(groupItem => new
                {
                    QuizQuestionId = groupItem.Key,
                    SelectedOptionId = groupItem
                        .Select(x => x.SelectedOptionId)
                        .FirstOrDefault()
                })
                .ToListAsync();

            // pobranie poprawych odp
            var correctOptionIds = await databaseContext.QuizAnswerOptions
                .Where(item =>
                    item.IsActive &&
                    item.IsCorrect &&
                    item.QuizQuestion.IsActive &&
                    item.QuizQuestion.QuizId == attempt.QuizId
                )
                .Select(item => item.QuizAnswerOptionId)
                .ToListAsync();

            var correctOptionIdSet = correctOptionIds.ToHashSet();

            decimal scoreEarned = 0;

            foreach (var questionItem in questions)
            {
                var answerItem = answersByQuestion
                    .FirstOrDefault(item => item.QuizQuestionId == questionItem.QuizQuestionId);

                if (answerItem == null)
                    continue;

                if (!answerItem.SelectedOptionId.HasValue)
                    continue;

                if (correctOptionIdSet.Contains(answerItem.SelectedOptionId.Value))
                    scoreEarned += questionItem.Points;
            }

            decimal? scorePercent = null;
            if (scoreTotal > 0)
                scorePercent = Math.Round((scoreEarned / scoreTotal) * 100m, 2);

            bool? passed = null;
            if (quizInfo.PassThresholdPct.HasValue && scorePercent.HasValue)
                passed = scorePercent.Value >= quizInfo.PassThresholdPct.Value;

            attempt.SubmittedAt = DateTime.UtcNow;
            attempt.ScoreTotal = scoreTotal;
            attempt.ScorePercent = scorePercent;
            attempt.Passed = passed;

            await databaseContext.SaveChangesAsync();
        }

        // pomocniczo, kurs + tutor + właściciel podejścia na podstawie ID attemptu
        public async Task<(int? CourseId, int AttemptUserId, int? TutorUserId)> GetAttemptCourseInfoAsync(int attemptId)
        {
            var info = await databaseContext.QuizAttempts
        .Where(item => item.QuizAttemptId == attemptId && item.IsActive)
        .Select(item => new
        {
            item.QuizAttemptId,
            AttemptUserId = item.UserId,

            LessonCourseId = item.Quiz.Lesson != null
                ? (int?)item.Quiz.Lesson.Module.CourseId
                : null,
            ModuleCourseId = item.Quiz.Module != null
                ? (int?)item.Quiz.Module.CourseId
                : null,

            LessonTutorId = item.Quiz.Lesson != null
                ? (int?)item.Quiz.Lesson.Module.Course.TutorUserId
                : null,
            ModuleTutorId = item.Quiz.Module != null
                ? (int?)item.Quiz.Module.Course.TutorUserId
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
