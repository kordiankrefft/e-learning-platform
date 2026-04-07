using Data.Dtos.PageContentBlock;

namespace Elearning.API.Services.Interfaces
{
    public interface IPageContentBlockService
    {
        Task CreateAsync(PageContentBlockCreateDto dto, int updatedByUserId);
        Task EditAsync(PageContentBlockEditDto dto, int updatedByUserId);
        Task DeleteAsync(int id);
        Task<List<PageContentBlockDto>> GetAllAsync();
        Task<PageContentBlockDto> GetAsync(int id);

        Task<List<PageContentBlockDto>> GetAllForPageAsync(string pageKey);
    }
}
