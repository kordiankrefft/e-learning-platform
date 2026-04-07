using Data.Dtos.UserCourseEnrollment;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class UserCourseEnrollmentService : BaseService, IUserCourseEnrollmentService
    {
        public UserCourseEnrollmentService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(UserCourseEnrollmentCreateDto dto, int userId)
        {
            UserCourseEnrollment enrollment = new()
            {
                UserId = userId,
                CourseId = dto.CourseId,
                Status = dto.Status!,
                IsActive = true,
                EnrolledAt = DateTime.UtcNow,
                CompletedAt = null
            };

            databaseContext.UserCourseEnrollments.Add(enrollment);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(UserCourseEnrollmentEditDto dto)
        {
            UserCourseEnrollment enrollment = databaseContext.UserCourseEnrollments
                .FirstOrDefault(item => item.UserCourseEnrollmentId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego zapisu na kurs o id {dto.Id}.");

            enrollment.Status = dto.Status!;
            enrollment.CompletedAt = dto.CompletedAt;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            UserCourseEnrollment enrollment = databaseContext.UserCourseEnrollments
                .FirstOrDefault(item => item.UserCourseEnrollmentId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego zapisu na kurs o id {id}.");

            enrollment.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task MarkCompletedAsync(int id)
        {
            UserCourseEnrollment enrollment = databaseContext.UserCourseEnrollments
                .FirstOrDefault(item => item.UserCourseEnrollmentId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego zapisu na kurs o id {id}.");

            enrollment.Status = "Completed";
            enrollment.CompletedAt ??= DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<UserCourseEnrollmentDto>> GetAllAsync()
        {
            List<UserCourseEnrollmentDto> dtos = await databaseContext.UserCourseEnrollments
                .Where(item => item.IsActive)
                .OrderBy(item => item.UserId)
                .ThenBy(item => item.CourseId)
                .Select(item => new UserCourseEnrollmentDto()
                {
                    Id = item.UserCourseEnrollmentId,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course.Title,
                    Status = item.Status,
                    EnrolledAt = item.EnrolledAt,
                    CompletedAt = item.CompletedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<UserCourseEnrollmentDto> GetAsync(int id)
        {
            UserCourseEnrollmentDto dto = await databaseContext.UserCourseEnrollments
                .Where(item => item.IsActive && item.UserCourseEnrollmentId == id)
                .Select(item => new UserCourseEnrollmentDto()
                {
                    Id = item.UserCourseEnrollmentId,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course.Title,
                    Status = item.Status,
                    EnrolledAt = item.EnrolledAt,
                    CompletedAt = item.CompletedAt,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego zapisu na kurs o id {id}.");

            return dto;
        }

        public async Task<List<UserCourseEnrollmentDto>> GetMyAsync(int userId)
        {
            List<UserCourseEnrollmentDto> dtos = await databaseContext.UserCourseEnrollments
                .Where(item => item.IsActive && item.UserId == userId)
                .OrderByDescending(item => item.EnrolledAt)
                .Select(item => new UserCourseEnrollmentDto()
                {
                    Id = item.UserCourseEnrollmentId,
                    UserId = item.UserId,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course.Title,
                    Status = item.Status,
                    EnrolledAt = item.EnrolledAt,
                    CompletedAt = item.CompletedAt,
                    IsActive = item.IsActive,       
                })
                .ToListAsync();

            return dtos;
        }
    }
}
