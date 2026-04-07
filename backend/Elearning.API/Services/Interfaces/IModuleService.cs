using Data.Dtos.Module;

namespace Elearning.API.Services.Interfaces
{
    public interface IModuleService
    {
        Task CreateAsync(ModuleCreateDto dto);
        Task EditAsync(ModuleEditDto dto);
        Task DeleteAsync(int id);
        Task<List<ModuleDto>> GetAllAsync();
        Task<ModuleDto> GetAsync(int id);

        Task<List<ModuleDto>> GetAllForCourseAsync(int courseId);

        Task<(int CourseId, int TutorUserId)?> GetCourseInfoForModuleAsync(int moduleId);
        Task<(int CourseId, int TutorUserId)?> GetCourseInfoForCourseAsync(int courseId);
    }
}
