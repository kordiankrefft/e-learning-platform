using Data.Dtos.Module;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class ModuleService : BaseService, IModuleService
    {
        public ModuleService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(ModuleCreateDto dto)
        {
            Module module = new()
            {
                CourseId = dto.CourseId,
                Title = dto.Title!,
                Description = dto.Description,
                OrderIndex = dto.OrderIndex,
                IsActive = true
            };

            databaseContext.Modules.Add(module);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(ModuleEditDto dto)
        {
            Module module = databaseContext.Modules
                .FirstOrDefault(item => item.ModuleId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego modułu o id {dto.Id}.");

            module.CourseId = dto.CourseId;
            module.Title = dto.Title!;
            module.Description = dto.Description;
            module.OrderIndex = dto.OrderIndex;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            Module module = databaseContext.Modules
                .FirstOrDefault(item => item.ModuleId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego modułu o id {id}.");

            module.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<ModuleDto>> GetAllAsync()
        {
            List<ModuleDto> dtos = await databaseContext.Modules
                .Where(item => item.IsActive)
                .OrderBy(item => item.CourseId)
                .ThenBy(item => item.OrderIndex)
                .Select(item => new ModuleDto()
                {
                    Id = item.ModuleId,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course.Title,
                    Title = item.Title,
                    Description = item.Description,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<ModuleDto> GetAsync(int id)
        {
            ModuleDto dto = await databaseContext.Modules
                .Where(item => item.IsActive && item.ModuleId == id)
                .Select(item => new ModuleDto()
                {
                    Id = item.ModuleId,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course.Title,
                    Title = item.Title,
                    Description = item.Description,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego modułu o id {id}.");

            return dto;
        }

        public async Task<List<ModuleDto>> GetAllForCourseAsync(int courseId)
        {
            return await databaseContext.Modules
                .Where(item => item.IsActive && item.CourseId == courseId)
                .OrderBy(item => item.OrderIndex)
                .Select(item => new ModuleDto
                {
                    Id = item.ModuleId,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course.Title,
                    Title = item.Title,
                    Description = item.Description,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .ToListAsync();
        }

        // Kurs + tutor na podstawie modułu
        public async Task<(int CourseId, int TutorUserId)?> GetCourseInfoForModuleAsync(int moduleId)
        {
            var result = await databaseContext.Modules
                .Where(item => item.ModuleId == moduleId && item.IsActive)
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

        // Kurs + tutor na podstawie courseId
        public async Task<(int CourseId, int TutorUserId)?> GetCourseInfoForCourseAsync(int courseId)
        {
            var result = await databaseContext.Courses
                .Where(item => item.CourseId == courseId && item.IsActive)
                .Select(item => new
                {
                    CourseId = item.CourseId,
                    TutorUserId = item.TutorUserId
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return null;

            return (result.CourseId, result.TutorUserId);
        }
    }
}
