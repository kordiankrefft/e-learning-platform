using Data.Dtos.PageContentBlock;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class PageContentBlockService : BaseService, IPageContentBlockService
    {
        public PageContentBlockService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(PageContentBlockCreateDto dto, int updatedByUserId)
        {
            PageContentBlock block = new()
            {
                PageKey = dto.PageKey!,
                BlockType = dto.BlockType!,
                Content = dto.Content,
                MediaFileId = dto.MediaFileId,
                OrderIndex = dto.OrderIndex,
                IsActive = true,
                UpdatedByUserId = updatedByUserId,
                UpdatedAt = DateTime.UtcNow
            };

            databaseContext.PageContentBlocks.Add(block);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(PageContentBlockEditDto dto, int updatedByUserId)
        {
            PageContentBlock block = databaseContext.PageContentBlocks
                .FirstOrDefault(item => item.PageContentBlockId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego bloku strony o id {dto.Id}.");

            block.PageKey = dto.PageKey!;
            block.BlockType = dto.BlockType!;
            block.Content = dto.Content;
            block.MediaFileId = dto.MediaFileId;
            block.OrderIndex = dto.OrderIndex;
            block.UpdatedByUserId = updatedByUserId;
            block.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            PageContentBlock block = databaseContext.PageContentBlocks
                .FirstOrDefault(item => item.PageContentBlockId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego bloku strony o id {id}.");

            block.IsActive = false;
            block.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<PageContentBlockDto>> GetAllAsync()
        {
            List<PageContentBlockDto> dtos = await databaseContext.PageContentBlocks
                .Where(item => item.IsActive)
                .OrderBy(item => item.PageKey)
                .ThenBy(item => item.OrderIndex)
                .Select(item => new PageContentBlockDto()
                {
                    Id = item.PageContentBlockId,
                    PageKey = item.PageKey,
                    BlockType = item.BlockType,
                    Content = item.Content,
                    MediaFileId = item.MediaFileId,
                    MediaFileUrl = item.MediaFile != null && item.MediaFile.IsActive ? item.MediaFile.FileUrl : null,
                    ThumbnailName = item.MediaFile!.FileName,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive,
                    UpdatedByUserId = item.UpdatedByUserId,
                    UpdatedAt = item.UpdatedAt
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<PageContentBlockDto> GetAsync(int id)
        {
            PageContentBlockDto dto = await databaseContext.PageContentBlocks
                .Where(item => item.IsActive && item.PageContentBlockId == id)
                .Select(item => new PageContentBlockDto()
                {
                    Id = item.PageContentBlockId,
                    PageKey = item.PageKey,
                    BlockType = item.BlockType,
                    Content = item.Content,
                    MediaFileId = item.MediaFileId,
                    MediaFileUrl = item.MediaFile != null && item.MediaFile.IsActive ? item.MediaFile.FileUrl : null,
                    ThumbnailName = item.MediaFile!.FileName,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive,
                    UpdatedByUserId = item.UpdatedByUserId,
                    UpdatedAt = item.UpdatedAt
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego bloku strony o id {id}.");

            return dto;
        }
        public async Task<List<PageContentBlockDto>> GetAllForPageAsync(string pageKey)
        {
            return await databaseContext.PageContentBlocks
                .Where(item => item.IsActive && item.PageKey == pageKey)
                .OrderBy(item => item.OrderIndex)
                .Select(item => new PageContentBlockDto
                {
                    Id = item.PageContentBlockId,
                    PageKey = item.PageKey,
                    BlockType = item.BlockType,
                    Content = item.Content,
                    MediaFileId = item.MediaFileId,
                    MediaFileUrl = item.MediaFile != null && item.MediaFile.IsActive ? item.MediaFile.FileUrl : null,
                    OrderIndex = item.OrderIndex,
                    IsActive = item.IsActive,
                    UpdatedByUserId = item.UpdatedByUserId,
                    UpdatedAt = item.UpdatedAt
                })
                .ToListAsync();
        }
    }
}
