using Data.Dtos.UserCourseAccess;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class UserCourseAccessService : BaseService, IUserCourseAccessService
    {
        public UserCourseAccessService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(UserCourseAccessCreateDto dto, int userId)
        {
            DateTime accessStart = DateTime.UtcNow;
            DateTime? accessEnd = null;

            if (dto.CoursePricingPlanId.HasValue)
            {
                var pricingPlan = await databaseContext.CoursePricingPlans
                    .Where(plan => plan.IsActive && plan.CoursePricingPlanId == dto.CoursePricingPlanId.Value)
                    .Select(plan => new { plan.CourseId, plan.AccessDurationDays })
                    .FirstOrDefaultAsync();

                if (pricingPlan == null)
                    throw new Exception("Nie znaleziono aktywnego planu cenowego.");

                if (pricingPlan.AccessDurationDays.HasValue)
                    accessEnd = accessStart.AddDays(pricingPlan.AccessDurationDays.Value);
            }

            UserCourseAccess access = new()
            {
                UserId = userId,
                CourseId = dto.CourseId,
                CoursePricingPlanId = dto.CoursePricingPlanId,
                AccessStart = accessStart,
                AccessEnd = accessEnd,
                IsRevoked = false,
                IsActive = true
            };

            databaseContext.UserCourseAccesses.Add(access);
            await databaseContext.SaveChangesAsync();
        }


        public async Task EditAsync(UserCourseAccessEditDto dto)
        {
            UserCourseAccess access = databaseContext.UserCourseAccesses
                .FirstOrDefault(item => item.UserCourseAccessId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego dostępu do kursu o id {dto.Id}.");

            access.CoursePricingPlanId = dto.CoursePricingPlanId;
            access.AccessEnd = dto.AccessEnd;
            access.IsRevoked = dto.IsRevoked;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            UserCourseAccess access = databaseContext.UserCourseAccesses
                .FirstOrDefault(item => item.UserCourseAccessId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego dostępu do kursu o id {id}.");

            access.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<UserCourseAccessDto>> GetAllAsync()
        {
            List<UserCourseAccessDto> dtos = await databaseContext.UserCourseAccesses
                .Where(item => item.IsActive)
                .OrderBy(item => item.UserId)
                .ThenBy(item => item.CourseId)
                .Select(item => new UserCourseAccessDto()
                {
                    Id = item.UserCourseAccessId,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course.Title,
                    CoursePricingPlanId = item.CoursePricingPlanId,
                    CoursePricingPlanName = item.CoursePricingPlan!.Name,
                    AccessStart = item.AccessStart,
                    AccessEnd = item.AccessEnd,
                    IsRevoked = item.IsRevoked,
                    IsActive = item.IsActive
                })
                .ToListAsync();
            
            return dtos;
        }

        public async Task<UserCourseAccessDto> GetAsync(int id)
        {
            UserCourseAccessDto dto = await databaseContext.UserCourseAccesses
                .Where(item => item.IsActive && item.UserCourseAccessId == id)
                .Select(item => new UserCourseAccessDto()
                {
                    Id = item.UserCourseAccessId,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course.Title,
                    CoursePricingPlanId = item.CoursePricingPlanId,
                    CoursePricingPlanName = item.CoursePricingPlan!.Name,
                    AccessStart = item.AccessStart,
                    AccessEnd = item.AccessEnd,
                    IsRevoked = item.IsRevoked,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego dostępu do kursu o id {id}.");

            return dto;
        }
        public async Task<List<UserCourseAccessDto>> GetMyAsync(int userId)
        {
            List<UserCourseAccessDto> dtos = await databaseContext.UserCourseAccesses
                .Where(item => item.IsActive && item.UserId == userId)
                .OrderByDescending(item => item.AccessStart)
                .Select(item => new UserCourseAccessDto()
                {
                    Id = item.UserCourseAccessId,
                    UserId = item.UserId,
                    CourseId = item.CourseId,
                    CoursePricingPlanId = item.CoursePricingPlanId,
                    AccessStart = item.AccessStart,
                    AccessEnd = item.AccessEnd,
                    IsRevoked = item.IsRevoked,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<bool> StudentHasAccessToCourseAsync(int userId, int courseId)
        {
            DateTime now = DateTime.UtcNow;

            return await databaseContext.UserCourseAccesses
                .AnyAsync(item =>
                    item.UserId == userId &&
                    item.CourseId == courseId &&
                    item.IsActive &&
                    !item.IsRevoked &&
                    item.AccessStart <= now &&
                    (item.AccessEnd == null || item.AccessEnd >= now));
        }
    }
}
