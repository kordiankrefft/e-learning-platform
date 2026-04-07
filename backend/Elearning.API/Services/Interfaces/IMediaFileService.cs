using Data.Dtos.MediaFile;

namespace Elearning.API.Services.Interfaces
{
    public interface IMediaFileService
    {
        Task CreateAsync(MediaFileCreateDto dto, int? uploadedByUserId);
        Task EditAsync(MediaFileEditDto dto);
        Task DeleteAsync(int id);
        Task<List<MediaFileDto>> GetAllAsync();
        Task<MediaFileDto> GetAsync(int id);
    }
}
