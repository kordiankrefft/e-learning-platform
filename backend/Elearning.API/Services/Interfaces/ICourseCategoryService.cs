using Data.Dtos.CourseCategory;

namespace Elearning.API.Services.Interfaces
{
    public interface ICourseCategoryService
    {
        Task CreateAsync(CourseCategoryCreateDto dto);
        Task EditAsync(CourseCategoryEditDto dto);
        Task DeleteAsync(int id);
        Task<List<CourseCategoryDto>> GetAllAsync();
        Task<CourseCategoryDto> GetAsync(int id);
    }
}
