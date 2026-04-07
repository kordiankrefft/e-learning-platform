using Data.Dtos.CourseCategory;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class CourseCategoryService : BaseService, ICourseCategoryService
    {
        public CourseCategoryService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(CourseCategoryCreateDto dto)
        {
            CourseCategory category = new()
            {
                Name = dto.Name!,
                Description = dto.Description,
                IsActive = true
            };

            databaseContext.CourseCategories.Add(category);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(CourseCategoryEditDto dto)
        {
            CourseCategory category = databaseContext.CourseCategories
                .FirstOrDefault(item => item.CourseCategoryId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnej kategorii o id {dto.Id}.");

            category.Name = dto.Name!;
            category.Description = dto.Description;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            CourseCategory category = databaseContext.CourseCategories
                .FirstOrDefault(item => item.CourseCategoryId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnej kategorii o id {id}.");

            category.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<CourseCategoryDto>> GetAllAsync()
        {
            List<CourseCategoryDto> dtos = await databaseContext.CourseCategories
                .Where(item => item.IsActive)
                .Select(item => new CourseCategoryDto()
                {
                    Id = item.CourseCategoryId,
                    Name = item.Name,
                    Description = item.Description,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<CourseCategoryDto> GetAsync(int id)
        {
            CourseCategoryDto dto = await databaseContext.CourseCategories
                .Where(item => item.IsActive && item.CourseCategoryId == id)
                .Select(item => new CourseCategoryDto()
                {
                    Id = item.CourseCategoryId,
                    Name = item.Name,
                    Description = item.Description,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnej kategorii o id {id}.");

            return dto;
        }
    }
}
