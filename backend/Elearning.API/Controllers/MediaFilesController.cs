using Data;
using Data.Dtos.MediaFile;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class MediaFilesController : BaseController
    {
        private readonly IMediaFileService service;

        public MediaFilesController(IMediaFileService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.MEDIA_FILES)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] MediaFileCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            await service.CreateAsync(dto, currentUserId.Value);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.MEDIA_FILES_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] MediaFileEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID in URL does not match DTO ID.");

            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                var file = await databaseContext.MediaFiles
                    .Where(item => item.MediaFileId == id && item.IsActive)
                    .Select(item => new
                    {
                        item.MediaFileId,
                        item.UploadedByUserId
                    })
                    .FirstOrDefaultAsync();

                if (file == null)
                    return BadRequest("Nie znaleziono aktywnego pliku o podanym id.");

                if (file.UploadedByUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.MEDIA_FILES_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                var file = await databaseContext.MediaFiles
                    .Where(item => item.MediaFileId == id && item.IsActive)
                    .Select(item => new
                    {
                        item.MediaFileId,
                        item.UploadedByUserId
                    })
                    .FirstOrDefaultAsync();

                if (file == null)
                    return BadRequest("Nie znaleziono aktywnego pliku o podanym id.");

                if (file.UploadedByUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.MEDIA_FILES)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.MEDIA_FILES_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> GetAsync(int id)
        {
            var result = await service.GetAsync(id);
            return Json(result);
        }
    }
}
