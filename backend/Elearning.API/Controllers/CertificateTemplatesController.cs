using Data;
using Data.Dtos.CertificateTemplate;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class CertificateTemplatesController : Controller
    {
        private readonly ICertificateTemplateService service;

        public CertificateTemplatesController(ICertificateTemplateService service)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.CERTIFICATE_TEMPLATES)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAsync([FromBody] CertificateTemplateCreateDto dto)
        {
            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.CERTIFICATE_TEMPLATES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditAsync([FromBody] CertificateTemplateEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest();

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.CERTIFICATE_TEMPLATES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.CERTIFICATE_TEMPLATES)]
        public async Task<IActionResult> GetAllAsync()
        {
            return Json(await service.GetAllAsync());
        }

        [HttpGet]
        [Route(Urls.CERTIFICATE_TEMPLATES_ID)]
        public async Task<IActionResult> GetAsync(int id)
        {
            return Json(await service.GetAsync(id));
        }
    }
}
