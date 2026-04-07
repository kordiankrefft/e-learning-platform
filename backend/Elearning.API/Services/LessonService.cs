using Data.Dtos.Lesson;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class LessonService : BaseService, ILessonService
    {
        private readonly IUserCourseAccessService userCourseAccessService;

        public LessonService(DatabaseContext databaseContext,
                             IUserCourseAccessService userCourseAccessService)
            : base(databaseContext)
        {
            this.userCourseAccessService = userCourseAccessService;
        }

        public async Task CreateAsync(LessonCreateDto dto)
        {
            Lesson lesson = new()
            {
                ModuleId = dto.ModuleId,
                Title = dto.Title!,
                Summary = dto.Summary,
                Status = dto.Status!,
                OrderIndex = dto.OrderIndex,
                EstimatedMinutes = dto.EstimatedMinutes,
                IsActive = true
            };

            databaseContext.Lessons.Add(lesson);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(LessonEditDto dto)
        {
            Lesson lesson = databaseContext.Lessons
                .FirstOrDefault(item => item.LessonId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnej lekcji o id {dto.Id}.");

            lesson.ModuleId = dto.ModuleId;
            lesson.Title = dto.Title!;
            lesson.Summary = dto.Summary;
            lesson.Status = dto.Status!;
            lesson.OrderIndex = dto.OrderIndex;
            lesson.EstimatedMinutes = dto.EstimatedMinutes;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            Lesson lesson = databaseContext.Lessons
                .FirstOrDefault(item => item.LessonId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnej lekcji o id {id}.");

            lesson.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<LessonDto>> GetAllAsync()
        {
            List<LessonDto> dtos = await databaseContext.Lessons
                .Where(item => item.IsActive)
                .OrderBy(item => item.ModuleId)
                .ThenBy(item => item.OrderIndex)
                .Select(item => new LessonDto()
                {
                    Id = item.LessonId,
                    ModuleId = item.ModuleId,
                    ModuleTitle = item.Module.Title,
                    Title = item.Title,
                    Summary = item.Summary,
                    Status = item.Status,
                    OrderIndex = item.OrderIndex,
                    EstimatedMinutes = item.EstimatedMinutes,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<LessonDto> GetAsync(int id)
        {
            LessonDto dto = await databaseContext.Lessons
                .Where(item => item.IsActive && item.LessonId == id)
                .Select(item => new LessonDto()
                {
                    Id = item.LessonId,
                    ModuleId = item.ModuleId,
                    ModuleTitle = item.Module.Title,
                    Title = item.Title,
                    Summary = item.Summary,
                    Status = item.Status,
                    OrderIndex = item.OrderIndex,
                    EstimatedMinutes = item.EstimatedMinutes,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnej lekcji o id {id}.");

            return dto;
        }

        public async Task<LessonDto> GetForStudentAsync(int id, int userId)
        {
            var courseInfo = await GetCourseInfoForLessonAsync(id);
            if (courseInfo == null)
                throw new Exception($"Nie odnaleziono aktywnej lekcji o id {id}.");

            int courseId = courseInfo.Value.CourseId;

            bool hasAccess = await userCourseAccessService.StudentHasAccessToCourseAsync(userId, courseId);
            if (!hasAccess)
                throw new Exception("Użytkownik nie ma dostępu do kursu powiązanego z tą lekcją.");

            return await GetAsync(id);
        }

        public async Task<List<LessonDto>> GetAllForModuleAsync(int moduleId)
        {
            return await databaseContext.Lessons
                .Where(item => item.IsActive && item.ModuleId == moduleId)
                .OrderBy(item => item.OrderIndex)
                .Select(item => new LessonDto
                {
                    Id = item.LessonId,
                    ModuleId = item.ModuleId,
                    ModuleTitle = item.Module.Title,
                    Title = item.Title,
                    Summary = item.Summary,
                    Status = item.Status,
                    OrderIndex = item.OrderIndex,
                    EstimatedMinutes = item.EstimatedMinutes,
                    IsActive = item.IsActive
                })
                .ToListAsync();
        }

        public async Task<(int CourseId, int TutorUserId)?> GetCourseInfoForModuleAsync(int moduleId)
        {
            var result = await databaseContext.Modules
                .Where(item => item.ModuleId == moduleId)
                .Select(item => new
                {
                    CourseId = item.CourseId,
                    TutorUserId = item.Course.TutorUserId
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return null;

            return (result.CourseId, result.TutorUserId);
        }

        public async Task<(int CourseId, int TutorUserId)?> GetCourseInfoForLessonAsync(int lessonId)
        {
            var result = await databaseContext.Lessons
                .Where(item => item.LessonId == lessonId && item.IsActive)
                .Select(item => new
                {
                    CourseId = item.Module.CourseId,
                    TutorUserId = item.Module.Course.TutorUserId
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return null;

            return (result.CourseId, result.TutorUserId);
        }

    }
}
