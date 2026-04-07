using Data;
using Data.Dtos.SupportTicket;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class SupportTicketsController : BaseController
    {
        private readonly ISupportTicketService service;

        public SupportTicketsController(ISupportTicketService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpGet]
        [Route(Urls.MY_SUPPORT_TICKETS)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyTicketsAsync()
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var result = await service.GetForStudentAsync(currentUserId.Value);
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.MY_ASSIGNED_TICKETS)]
        [Authorize(Roles = "Tutor")]
        public async Task<IActionResult> GetMyAssignedTicketsAsync()
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var result = await service.GetForTutorAsync(currentUserId.Value);
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.SUPPORT_TICKETS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.SUPPORT_TICKETS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            var result = await service.GetAsync(id);
            return Json(result);
        }

        [HttpPost]
        [Route(Urls.SUPPORT_TICKETS)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateAsync([FromBody] SupportTicketCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            await service.CreateAsync(dto, currentUserId.Value);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.SUPPORT_TICKETS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditAsync([FromBody] SupportTicketEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID in URL does not match DTO ID.");

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.SUPPORT_TICKETS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }
    }
}
