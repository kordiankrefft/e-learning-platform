using Data;
using Data.Dtos.Announcement;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class AnnouncementsController : BaseController
    {
        private readonly IAnnouncementService service;

        public AnnouncementsController(IAnnouncementService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.ANNOUNCEMENTS)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] AnnouncementCreateDto dto)
        {
            int? userId = await GetCurrentUserIdAsync();
            if (userId == null)
                return Unauthorized();

            await service.CreateAsync(dto, userId.Value);

            return Ok();
        }

        [HttpPut]
        [Route(Urls.ANNOUNCEMENTS_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] AnnouncementEditDto dto, int id)
        {
            if (dto.Id != id)
            {
                return BadRequest();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.ANNOUNCEMENTS_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.ANNOUNCEMENTS)]
        public async Task<IActionResult> GetAllAsync([FromQuery] bool includeAll = false)
        {
            // publicznie: zawsze zwracamy tylko widoczne
            // includeAll działa tylko dla Admin/Tutor

            if (includeAll)
            {
                bool canSeeAll = User?.Identity?.IsAuthenticated == true &&
                                 (User.IsInRole("Admin") || User.IsInRole("Tutor"));

                if (!canSeeAll)
                {
                    includeAll = false;
                }
            }

            return Json(await service.GetAllAsync(includeAll));
        }

        [HttpGet]
        [Route(Urls.ANNOUNCEMENTS_ID)]
        public async Task<IActionResult> GetAsync(int id)
        {
            return Json(await service.GetAsync(id));
        }
    }
}
