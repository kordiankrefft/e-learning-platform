using Data.Dtos.LessonContentBlock;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class LessonContentBlockService : BaseService, ILessonContentBlockService
    {
        public LessonContentBlockService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(LessonContentBlockCreateDto dto)
        {
            LessonContentBlock block = new()
            {
                LessonId = dto.LessonId,
                BlockType = dto.BlockType!,
                Content = dto.Content,
                OrderIndex = dto.OrderIndex,
                IsActive = true
            };

            databaseContext.LessonContentBlocks.Add(block);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(LessonContentBlockEditDto dto)
        {
            LessonContentBlock block = databaseContext.LessonContentBlocks
                .FirstOrDefault(item => item.LessonContentBlockId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego bloku treści o id {dto.Id}.");

            block.LessonId = dto.LessonId;
            block.BlockType = dto.BlockType!;
            block.Content = dto.Content;
            block.OrderIndex = dto.OrderIndex;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            LessonContentBlock block = databaseContext.LessonContentBlocks
                .FirstOrDefault(item => item.LessonContentBlockId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego bloku treści o id {id}.");

            block.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<LessonContentBlockDto>> GetAllAsync()
        {
            List<LessonContentBlockDto> dtos = await databaseContext.LessonContentBlocks
                .Where(item => item.IsActive)
                .OrderBy(item => item.LessonId)
                .ThenBy(item => item.OrderIndex)
                .Select(item => new LessonContentBlockDto()
                {
                    Id = item.LessonContentBlockId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson.Title,
                    BlockType = item.BlockType,
                    Content = item.Content,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<LessonContentBlockDto> GetAsync(int id)
        {
            LessonContentBlockDto dto = await databaseContext.LessonContentBlocks
                .Where(item => item.IsActive && item.LessonContentBlockId == id)
                .Select(item => new LessonContentBlockDto()
                {
                    Id = item.LessonContentBlockId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson.Title,
                    BlockType = item.BlockType,
                    Content = item.Content,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego bloku treści o id {id}.");

            return dto;
        }
        public async Task<List<LessonContentBlockDto>> GetAllForLessonAsync(int lessonId)
        {
            return await databaseContext.LessonContentBlocks
                .Where(item => item.IsActive && item.LessonId == lessonId)
                .OrderBy(item => item.OrderIndex)
                .Select(item => new LessonContentBlockDto
                {
                    Id = item.LessonContentBlockId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson.Title,
                    BlockType = item.BlockType,
                    Content = item.Content,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive
                })
                .ToListAsync();
        }

        // Kurs + tutor na podstawie lekcji
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

        // Kurs + tutor na podstawie content blocka
        public async Task<(int CourseId, int TutorUserId)?> GetCourseInfoForContentBlockAsync(int contentBlockId)
        {
            var result = await databaseContext.LessonContentBlocks
                .Where(item => item.LessonContentBlockId == contentBlockId && item.IsActive)
                .Select(item => new
                {
                    CourseId = item.Lesson.Module.CourseId,
                    TutorUserId = item.Lesson.Module.Course.TutorUserId
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return null;

            return (result.CourseId, result.TutorUserId);
        }

    }
}
