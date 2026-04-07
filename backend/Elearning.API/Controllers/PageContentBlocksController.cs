using Data;
using Data.Dtos.PageContentBlock;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class PageContentBlocksController : BaseController
    {
        private readonly IPageContentBlockService service;

        public PageContentBlocksController(IPageContentBlockService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.PAGE_CONTENT_BLOCKS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAsync([FromBody] PageContentBlockCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            await service.CreateAsync(dto, currentUserId.Value);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.PAGE_CONTENT_BLOCKS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditAsync([FromBody] PageContentBlockEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID in URL does not match DTO ID.");

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            await service.EditAsync(dto, currentUserId.Value);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.PAGE_CONTENT_BLOCKS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.PAGE_CONTENT_BLOCKS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.PAGE_CONTENT_BLOCKS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            var result = await service.GetAsync(id);
            return Json(result);
        }

        // publiczny, bloki dla konkretnej strony po pageKey
        [HttpGet]
        [AllowAnonymous]
        [Route(Urls.PAGE_CONTENT_BLOCKS_PAGE)]
        public async Task<IActionResult> GetByPageAsync(string pageKey)
        {
            var result = await service.GetAllForPageAsync(pageKey);
            return Json(result);
        }
    }
}
