using Data.Dtos.LessonAttachment;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class LessonAttachmentService : BaseService, ILessonAttachmentService
    {
        public LessonAttachmentService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(LessonAttachmentCreateDto dto)
        {
            LessonAttachment attachment = new()
            {
                LessonId = dto.LessonId,
                FileName = dto.FileName!,
                FileUrl = dto.FileUrl!,
                Description = dto.Description,
                IsActive = true
            };

            databaseContext.LessonAttachments.Add(attachment);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(LessonAttachmentEditDto dto)
        {
            LessonAttachment attachment = databaseContext.LessonAttachments
                .FirstOrDefault(item => item.LessonAttachmentId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego załącznika lekcji o id {dto.Id}.");

            attachment.LessonId = dto.LessonId;
            attachment.FileName = dto.FileName!;
            attachment.FileUrl = dto.FileUrl!;
            attachment.Description = dto.Description;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            LessonAttachment attachment = databaseContext.LessonAttachments
                .FirstOrDefault(item => item.LessonAttachmentId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego załącznika lekcji o id {id}.");

            attachment.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<LessonAttachmentDto>> GetAllAsync()
        {
            List<LessonAttachmentDto> dtos = await databaseContext.LessonAttachments
                .Where(item => item.IsActive)
                .OrderBy(item => item.LessonId)
                .ThenBy(item => item.LessonAttachmentId)
                .Select(item => new LessonAttachmentDto()
                {
                    Id = item.LessonAttachmentId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson.Title,
                    FileName = item.FileName,
                    FileUrl = item.FileUrl,
                    Description = item.Description,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<LessonAttachmentDto> GetAsync(int id)
        {
            LessonAttachmentDto dto = await databaseContext.LessonAttachments
                .Where(item => item.IsActive && item.LessonAttachmentId == id)
                .Select(item => new LessonAttachmentDto()
                {
                    Id = item.LessonAttachmentId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson.Title,
                    FileName = item.FileName,
                    FileUrl = item.FileUrl,
                    Description = item.Description,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego załącznika lekcji o id {id}.");

            return dto;
        }

        public async Task<List<LessonAttachmentDto>> GetAllForLessonAsync(int lessonId)
        {
            return await databaseContext.LessonAttachments
                .Where(item => item.IsActive && item.LessonId == lessonId)
                .Select(item => new LessonAttachmentDto
                {
                    Id = item.LessonAttachmentId,
                    LessonId = item.LessonId,
                    LessonTitle = item.Lesson.Title,
                    FileName = item.FileName,
                    FileUrl = item.FileUrl,
                    Description = item.Description,
                    IsActive = item.IsActive
                })
                .ToListAsync();
        }

        // Kurs + tutor dla lekcji
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

        // Kurs + tutor dla załącznika
        public async Task<(int CourseId, int TutorUserId)?> GetCourseInfoForAttachmentAsync(int attachmentId)
        {
            var result = await databaseContext.LessonAttachments
                .Where(item => item.LessonAttachmentId == attachmentId && item.IsActive)
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
