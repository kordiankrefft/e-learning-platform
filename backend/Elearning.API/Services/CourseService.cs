using Data.Dtos.Course;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class CourseService : BaseService, ICourseService
    {
        public CourseService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(CourseCreateDto dto, int tutorUserId)
        {
            Course course = new()
            {
                CourseCategoryId = dto.CourseCategoryId!.Value,
                Title = dto.Title!,
                ShortDescription = dto.ShortDescription,
                LongDescription = dto.LongDescription,
                DifficultyLevel = dto.DifficultyLevel,
                Status = dto.Status!,
                ThumbnailMediaId = dto.ThumbnailMediaId,

                TutorUserId = tutorUserId,

                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };

            databaseContext.Courses.Add(course);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(CourseEditDto dto)
        {
            Course course = databaseContext.Courses
                .FirstOrDefault(item => item.CourseId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego kursu o id {dto.Id}.");

            course.CourseCategoryId = dto.CourseCategoryId;
            course.Title = dto.Title!;
            course.ShortDescription = dto.ShortDescription;
            course.LongDescription = dto.LongDescription;
            course.DifficultyLevel = dto.DifficultyLevel;
            course.Status = dto.Status!;
            course.ThumbnailMediaId = dto.ThumbnailMediaId;

            course.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            Course course = databaseContext.Courses
                .FirstOrDefault(item => item.CourseId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego kursu o id {id}.");

            course.IsActive = false;
            course.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<CourseDto>> GetAllAsync()
        {
            List<CourseDto> dtos = await databaseContext.Courses
                .Where(item => item.IsActive)
                .Select(item => new CourseDto()
                {
                    Id = item.CourseId,
                    CourseCategoryId = item.CourseCategoryId,
                    CourseCategoryName = item.CourseCategory!.Name,
                    Title = item.Title,
                    ShortDescription = item.ShortDescription,
                    LongDescription = item.LongDescription,
                    DifficultyLevel = item.DifficultyLevel,
                    Status = item.Status,
                    ThumbnailMediaId = item.ThumbnailMediaId,
                    ThumbnailUrl = item.ThumbnailMedia != null && item.ThumbnailMedia.IsActive
                        ? item.ThumbnailMedia.FileUrl
                        : null,
                    ThumbnailName = item.ThumbnailMedia!.FileName,
                    TutorUserId = item.TutorUserId,
                    TutorUserName = item. TutorUser.UserProfile!.DisplayName!,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<CourseDto> GetAsync(int id)
        {
            CourseDto dto = await databaseContext.Courses
                .Where(item => item.IsActive && item.CourseId == id)
                .Select(item => new CourseDto()
                {
                    Id = item.CourseId,
                    CourseCategoryId = item.CourseCategoryId,
                    CourseCategoryName = item.CourseCategory!.Name,
                    Title = item.Title,
                    ShortDescription = item.ShortDescription,
                    LongDescription = item.LongDescription,
                    DifficultyLevel = item.DifficultyLevel,
                    Status = item.Status,
                    ThumbnailMediaId = item.ThumbnailMediaId,
                    ThumbnailUrl = item.ThumbnailMedia != null && item.ThumbnailMedia.IsActive
                        ? item.ThumbnailMedia.FileUrl
                        : null,
                    ThumbnailName = item.ThumbnailMedia!.FileName,
                    TutorUserId = item.TutorUserId,
                    TutorUserName = item.TutorUser.UserProfile!.DisplayName!,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego kursu o id {id}.");

            return dto;
        }

        public async Task<List<CourseDto>> GetAllForTutorAsync(int tutorUserId)
        {
            List<CourseDto> dtos = await databaseContext.Courses
                .Where(item => item.IsActive && item.TutorUserId == tutorUserId)
                .Select(item => new CourseDto()
                {
                    Id = item.CourseId,
                    CourseCategoryId = item.CourseCategoryId,
                    CourseCategoryName = item.CourseCategory!.Name,
                    Title = item.Title,
                    ShortDescription = item.ShortDescription,
                    LongDescription = item.LongDescription,
                    DifficultyLevel = item.DifficultyLevel,
                    Status = item.Status,
                    ThumbnailMediaId = item.ThumbnailMediaId,
                    ThumbnailUrl = item.ThumbnailMedia != null && item.ThumbnailMedia.IsActive
                        ? item.ThumbnailMedia.FileUrl
                        : null,
                    ThumbnailName = item.ThumbnailMedia!.FileName,
                    TutorUserId = item.TutorUserId,
                    TutorUserName = item.TutorUser.UserProfile!.DisplayName!,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }
    }
}
