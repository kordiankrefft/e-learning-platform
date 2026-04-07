using Data.Dtos.CertificateTemplate;

namespace Elearning.API.Services.Interfaces
{
    public interface ICertificateTemplateService
    {
        Task CreateAsync(CertificateTemplateCreateDto dto);
        Task EditAsync(CertificateTemplateEditDto dto);
        Task DeleteAsync(int id);
        Task<List<CertificateTemplateDto>> GetAllAsync();
        Task<CertificateTemplateDto> GetAsync(int id);
    }
}
