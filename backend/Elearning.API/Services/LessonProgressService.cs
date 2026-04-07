using Data.Dtos.LessonProgress;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class LessonProgressService : BaseService, ILessonProgressService
    {
        public LessonProgressService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(LessonProgressCreateDto dto, int userId)
        {
            decimal percent = dto.ProgressPercent;

            if (percent < 0)
                percent = 0;

            if (percent > 100)
                percent = 100;

            LessonProgress? existing = await databaseContext.LessonProgresses
                .FirstOrDefaultAsync(item =>
                    item.UserId == userId &&
                    item.LessonId == dto.LessonId &&
                    item.IsActive);

            DateTime now = DateTime.UtcNow;

            if (existing == null)
            {
                LessonProgress progress = new()
                {
                    UserId = userId,
                    LessonId = dto.LessonId,
                    ProgressPercent = percent,
                    LastViewedAt = now,
                    IsActive = true
                };

                databaseContext.LessonProgresses.Add(progress);
            }
            else
            {
                existing.LastViewedAt = now;

                if (percent > existing.ProgressPercent)
                    existing.ProgressPercent = percent;
            }

            await databaseContext.SaveChangesAsync();
        }


        public async Task DeleteAsync(int id)
        {
            LessonProgress progress = databaseContext.LessonProgresses
                .FirstOrDefault(item => item.LessonProgressId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego postępu lekcji o id {id}.");

            progress.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<LessonProgressDto>> GetAllAsync()
        {
            List<LessonProgressDto> dtos = await databaseContext.LessonProgresses
                .Where(item => item.IsActive)
                .OrderBy(item => item.UserId)
                .ThenBy(item => item.LessonId)
                .Select(item => new LessonProgressDto()
                {
                    Id = item.LessonProgressId,
                    UserId = item.UserId,
                    UserName = item.User!.UserProfile!.DisplayName!,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson.Title,
                    ProgressPercent = item.ProgressPercent,
                    LastViewedAt = item.LastViewedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<List<LessonProgressDto>> GetAllForUserAsync(int userId)
        {
            List<LessonProgressDto> dtos = await databaseContext.LessonProgresses
                .Where(item => item.IsActive && item.UserId == userId)
                .OrderBy(item => item.LessonId)
                .Select(item => new LessonProgressDto()
                {
                    Id = item.LessonProgressId,
                    UserId = item.UserId,
                    LessonId = item.LessonId,
                    ProgressPercent = item.ProgressPercent,
                    LastViewedAt = item.LastViewedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<List<LessonProgressDto>> GetAllForTutorAsync(int tutorUserId)
        {
            List<LessonProgressDto> dtos = await databaseContext.LessonProgresses
                .Where(item =>
                    item.IsActive &&
                    item.Lesson.IsActive &&
                    item.Lesson.Module.IsActive &&
                    item.Lesson.Module.Course.IsActive &&
                    item.Lesson.Module.Course.TutorUserId == tutorUserId
                )
                .OrderBy(item => item.UserId)
                .ThenBy(item => item.LessonId)
                .Select(item => new LessonProgressDto()
                {
                    Id = item.LessonProgressId,
                    UserId = item.UserId,
                    LessonId = item.LessonId,
                    ProgressPercent = item.ProgressPercent,
                    LastViewedAt = item.LastViewedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<LessonProgressDto> GetAsync(int id)
        {
            LessonProgressDto dto = await databaseContext.LessonProgresses
                .Where(item => item.IsActive && item.LessonProgressId == id)
                .Select(item => new LessonProgressDto()
                {
                    Id = item.LessonProgressId,
                    UserId = item.UserId,
                    UserName = item.User!.UserProfile!.DisplayName!,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson.Title,
                    ProgressPercent = item.ProgressPercent,
                    LastViewedAt = item.LastViewedAt,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego postępu lekcji o id {id}.");

            return dto;
        }

        public async Task<int?> GetCourseIdForLessonAsync(int lessonId)
        {
            var result = await databaseContext.Lessons
                .Where(item => item.LessonId == lessonId && item.IsActive)
                .Select(item => item.Module.CourseId)
                .FirstOrDefaultAsync();

            if (result == 0)
                return null;

            return result;
        }

        public async Task<(int UserId, int CourseId, int TutorUserId)?> GetProgressAccessInfoAsync(int lessonProgressId)
        {
            var result = await databaseContext.LessonProgresses
                .Where(item => item.LessonProgressId == lessonProgressId && item.IsActive)
                .Select(item => new
                {
                    item.UserId,
                    CourseId = item.Lesson.Module.CourseId,
                    TutorUserId = item.Lesson.Module.Course.TutorUserId
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return null;

            return (result.UserId, result.CourseId, result.TutorUserId);
        }
    }
}

