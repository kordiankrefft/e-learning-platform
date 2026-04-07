using Data;
using Data.Dtos.IssuedCertificate;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class IssuedCertificatesController : BaseController
    {
        private readonly IIssuedCertificateService service;

        public IssuedCertificatesController(IIssuedCertificateService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpDelete]
        [Route(Urls.ISSUED_CERTIFICATES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok(); 
        }

        [HttpGet]
        [Route(Urls.ISSUED_CERTIFICATES)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            return Json(await service.GetAllAsync());
        }

        [HttpGet]
        [Route(Urls.ISSUED_CERTIFICATES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            return Json(await service.GetAsync(id));
        }

        [HttpGet]
        [Route(Urls.COURSE_CERTIFICATE_DOWNLOAD)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> DownloadForCurrentUser(int courseId)
        {
            int? userId = await GetCurrentUserIdAsync();
            if (userId == null)
                return Unauthorized();

            var result = await service.DownloadForUserAsync(courseId, userId.Value);

            return File(
                result.FileBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                result.FileName
            );
        }
    }
}
