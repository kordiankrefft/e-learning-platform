using Data.Dtos.CoursePricingPlan;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class CoursePricingPlanService : BaseService, ICoursePricingPlanService
    {
        public CoursePricingPlanService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(CoursePricingPlanCreateDto dto)
        {
            CoursePricingPlan plan = new()
            {
                CourseId = dto.CourseId,
                Name = dto.Name!,
                Description = dto.Description,
                AccessDurationDays = dto.AccessDurationDays,
                IsActive = true
            };

            databaseContext.CoursePricingPlans.Add(plan);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(CoursePricingPlanEditDto dto)
        {
            CoursePricingPlan plan = databaseContext.CoursePricingPlans
                .FirstOrDefault(item => item.CoursePricingPlanId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego planu cenowego o id {dto.Id}.");

            plan.CourseId = dto.CourseId;
            plan.Name = dto.Name!;
            plan.Description = dto.Description;
            plan.AccessDurationDays = dto.AccessDurationDays;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            CoursePricingPlan plan = databaseContext.CoursePricingPlans
                .FirstOrDefault(item => item.CoursePricingPlanId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego planu cenowego o id {id}.");

            plan.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<CoursePricingPlanDto>> GetAllAsync()
        {
            List<CoursePricingPlanDto> dtos = await databaseContext.CoursePricingPlans
                .Where(item => item.IsActive)
                .Select(item => new CoursePricingPlanDto()
                {
                    Id = item.CoursePricingPlanId,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course!.Title,
                    Name = item.Name,
                    Description = item.Description,
                    AccessDurationDays = item.AccessDurationDays,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<CoursePricingPlanDto> GetAsync(int id)
        {
            CoursePricingPlanDto dto = await databaseContext.CoursePricingPlans
                .Where(item => item.IsActive && item.CoursePricingPlanId == id)
                .Select(item => new CoursePricingPlanDto()
                {
                    Id = item.CoursePricingPlanId,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course!.Title,
                    Name = item.Name,
                    Description = item.Description,
                    AccessDurationDays = item.AccessDurationDays,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego planu cenowego o id {id}.");

            return dto;
        }
    }
}
