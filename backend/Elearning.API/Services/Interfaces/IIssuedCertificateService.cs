using Data.Dtos.IssuedCertificate;

namespace Elearning.API.Services.Interfaces
{
    public interface IIssuedCertificateService
    {
        Task DeleteAsync(int id);
        Task<List<IssuedCertificateDto>> GetAllAsync();
        Task<IssuedCertificateDto> GetAsync(int id);

        // NOWE: pobieranie (generuje jeśli trzeba)
        Task<(byte[] FileBytes, string FileName)> DownloadForUserAsync(int courseId, int userId);
    }
}
