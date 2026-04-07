using Data;
using Data.Dtos.SupportMessage;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class SupportMessagesController : BaseController
    {
        private readonly ISupportMessageService service;

        public SupportMessagesController(ISupportMessageService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.SUPPORT_MESSAGES)]
        [Authorize(Roles = "Student,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] SupportMessageCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            // pobieramy ticket powiązany z wiadomością
            var ticket = await databaseContext.SupportTickets
                .FirstOrDefaultAsync(item =>
                    item.SupportTicketId == dto.SupportTicketId &&
                    item.IsActive);

            if (ticket == null)
                return BadRequest("Nie znaleziono aktywnego zgłoszenia o podanym id.");

            // Student lub Tutor – muszą być uczestnikami zgłoszenia
            bool isOwner = ticket.UserId == currentUserId.Value;
            bool isAssignedTutor = ticket.AssignedTutorId == currentUserId.Value;

            if (!isOwner && !isAssignedTutor)
                return Forbid();

            await service.CreateAsync(dto, currentUserId.Value);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.SUPPORT_MESSAGES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.SUPPORT_MESSAGES)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.SUPPORT_MESSAGES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            var result = await service.GetAsync(id);
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.SUPPORT_TICKET_MESSAGES)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetForTicketAsync(int ticketId)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");

            var ticket = await databaseContext.SupportTickets
                .FirstOrDefaultAsync(item =>
                    item.SupportTicketId == ticketId &&
                    item.IsActive);

            if (ticket == null)
                return BadRequest("Nie znaleziono aktywnego zgłoszenia o podanym id.");

            if (!isAdmin)
            {
                bool isOwner = ticket.UserId == currentUserId.Value;
                bool isAssignedTutor = ticket.AssignedTutorId == currentUserId.Value;

                if (!isOwner && !isAssignedTutor)
                    return Forbid();
            }

            var messages = await service.GetForTicketAsync(ticketId);
            return Json(messages);
        }
    }
}
