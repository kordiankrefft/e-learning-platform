using Data;
using Data.Dtos.UserNotification;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class UserNotificationsController : BaseController
    {
        private readonly IUserNotificationService service;

        public UserNotificationsController(IUserNotificationService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpGet]
        [Route(Urls.USER_NOTIFICATIONS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.USER_NOTIFICATIONS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            var dto = await service.GetAsync(id);
            return Json(dto);
        }

        [HttpPut]
        [Route(Urls.USER_NOTIFICATIONS_ID)]
        [Authorize(Roles = "Admin,Student,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] UserNotificationEditDto dto, int id)
        {
            if (User.IsInRole("Admin"))
            {
                if (dto.Id != id)
                    return BadRequest("ID in URL does not match DTO ID.");

                await service.EditAsync(dto);
                return Ok();
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var info = await databaseContext.UserNotifications
                .Where(item => item.UserNotificationId == id && item.IsActive)
                .Select(item => new { item.UserId })
                .FirstOrDefaultAsync();

            if (info == null)
                return NotFound("Nie znaleziono aktywnego powiadomienia o podanym id.");

            if (info.UserId != currentUserId.Value)
                return Forbid();

            dto.Id = id;
            dto.IsRead = true;

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.USER_NOTIFICATIONS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.USER_NOTIFICATIONS_MY)]
        [Authorize]
        public async Task<IActionResult> GetMyAsync()
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var result = await service.GetForUserAsync(currentUserId.Value);
            return Json(result);
        }
    }
}
