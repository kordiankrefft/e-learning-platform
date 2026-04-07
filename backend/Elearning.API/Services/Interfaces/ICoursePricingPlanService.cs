using Data.Dtos.CoursePricingPlan;

namespace Elearning.API.Services.Interfaces
{
    public interface ICoursePricingPlanService
    {
        Task CreateAsync(CoursePricingPlanCreateDto dto);
        Task EditAsync(CoursePricingPlanEditDto dto);
        Task DeleteAsync(int id);
        Task<List<CoursePricingPlanDto>> GetAllAsync();
        Task<CoursePricingPlanDto> GetAsync(int id);
    }
}
