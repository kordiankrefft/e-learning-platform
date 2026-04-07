using Data.Dtos.CertificateTemplate;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class CertificateTemplateService : BaseService, ICertificateTemplateService
    {
        public CertificateTemplateService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(CertificateTemplateCreateDto dto)
        {
            CertificateTemplate template = new()
            {
                Name = dto.Name!,
                Description = dto.Description,
                TemplateBody = dto.TemplateBody,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };

            databaseContext.CertificateTemplates.Add(template);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(CertificateTemplateEditDto dto)
        {
            CertificateTemplate template = await databaseContext.CertificateTemplates
                .FirstOrDefaultAsync(item => item.CertificateTemplateId == dto.Id)
                ?? throw new Exception($"Nie odnaleziono szablonu certyfikatu o id {dto.Id}.");

            template.Name = dto.Name!;
            template.Description = dto.Description;
            template.TemplateBody = dto.TemplateBody;
            template.UpdatedAt = DateTime.UtcNow;
            template.IsActive = true;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            CertificateTemplate template = databaseContext.CertificateTemplates
                .FirstOrDefault(item => item.CertificateTemplateId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego szablonu certyfikatu o id {id}.");

            template.IsActive = false;
            template.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<CertificateTemplateDto>> GetAllAsync()
        {
            List<CertificateTemplateDto> dtos = await databaseContext.CertificateTemplates
                .Where(item => item.IsActive)
                .Select(item => new CertificateTemplateDto()
                {
                    Id = item.CertificateTemplateId,
                    Name = item.Name,
                    Description = item.Description,
                    TemplateBody = item.TemplateBody,
                    IsActive = item.IsActive,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<CertificateTemplateDto> GetAsync(int id)
        {
            CertificateTemplateDto dto = await databaseContext.CertificateTemplates
                .Where(item => item.IsActive && item.CertificateTemplateId == id)
                .Select(item => new CertificateTemplateDto()
                {
                    Id = item.CertificateTemplateId,
                    Name = item.Name,
                    Description = item.Description,
                    TemplateBody = item.TemplateBody,
                    IsActive = item.IsActive,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego szablonu certyfikatu o id {id}.");

            return dto;
        }
    }
}
