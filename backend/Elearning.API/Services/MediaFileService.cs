using Data.Dtos.MediaFile;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class MediaFileService : BaseService, IMediaFileService
    {
        public MediaFileService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(MediaFileCreateDto dto, int? uploadedByUserId)
        {
            MediaFile file = new()
            {
                FileUrl = dto.FileUrl!,
                FileName = dto.FileName!,
                MimeType = dto.MimeType,
                Width = dto.Width,
                Height = dto.Height,
                UploadedAt = DateTime.UtcNow,
                UploadedByUserId = uploadedByUserId,
                IsActive = true
            };

            databaseContext.MediaFiles.Add(file);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(MediaFileEditDto dto)
        {
            MediaFile file = databaseContext.MediaFiles
                .FirstOrDefault(item => item.MediaFileId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego pliku medialnego o id {dto.Id}.");

            file.FileUrl = dto.FileUrl!;
            file.FileName = dto.FileName!;
            file.MimeType = dto.MimeType;
            file.Width = dto.Width;
            file.Height = dto.Height;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            MediaFile file = databaseContext.MediaFiles
                .FirstOrDefault(item => item.MediaFileId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego pliku medialnego o id {id}.");

            file.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<MediaFileDto>> GetAllAsync()
        {
            List<MediaFileDto> dtos = await databaseContext.MediaFiles
                .Where(item => item.IsActive)
                .OrderByDescending(item => item.UploadedAt)
                .Select(item => new MediaFileDto()
                {
                    Id = item.MediaFileId,
                    FileUrl = item.FileUrl,
                    FileName = item.FileName,
                    MimeType = item.MimeType,
                    Width = item.Width,
                    Height = item.Height,
                    UploadedAt = item.UploadedAt,
                    UploadedByUserId = item.UploadedByUserId,
                    UserName = item.UploadedByUser!.UserProfile!.DisplayName!,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<MediaFileDto> GetAsync(int id)
        {
            MediaFileDto dto = await databaseContext.MediaFiles
                .Where(item => item.IsActive && item.MediaFileId == id)
                .Select(item => new MediaFileDto()
                {
                    Id = item.MediaFileId,
                    FileUrl = item.FileUrl,
                    FileName = item.FileName,
                    MimeType = item.MimeType,
                    Width = item.Width,
                    Height = item.Height,
                    UploadedAt = item.UploadedAt,
                    UploadedByUserId = item.UploadedByUserId,
                    UserName = item.UploadedByUser!.UserProfile!.DisplayName!,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego pliku medialnego o id {id}.");

            return dto;
        }
    }
}
