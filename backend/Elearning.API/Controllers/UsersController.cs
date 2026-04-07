using Data;
using Data.Dtos.User;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class UsersController : BaseController
    {
        private readonly IUserService service;

        public UsersController(IUserService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.USERS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAsync([FromBody] UserCreateDto dto, string identityUserId)
        {
            await service.CreateAsync(dto, identityUserId);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.USERS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.USERS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminAsync(int id)
        {
            var result = await service.GetAdminAsync(id);
            return Json(result);
        }

        [HttpPut]
        [Route(Urls.USERS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditAsync([FromBody] UserEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID in URL does not match DTO ID.");

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.USERS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }


        [HttpGet]
        [Route(Urls.USERS_ME)]
        [Authorize]
        public async Task<IActionResult> GetMeAsync()
        {
            string? identityUserId = GetCurrentIdentityUserId();
            if (string.IsNullOrWhiteSpace(identityUserId))
                return Unauthorized();

            // zapewnij rekord w tabeli Users (nawet jeśli profil jeszcze nie istnieje)
            var user = await service.EnsureUserExistsAsync(identityUserId);

            // jeśli nie ma profilu front pokaże formularz tworzenia
            if (user.UserProfile == null)
                return NotFound("Profil użytkownika nie został jeszcze utworzony.");

            var dto = await service.GetAsync(user.UserId);
            return Json(dto);
        }

        [HttpPost]
        [Route(Urls.USERS_ME)]
        [Authorize]
        public async Task<IActionResult> CreateMeAsync([FromBody] UserCreateDto dto)
        {
            string? identityUserId = GetCurrentIdentityUserId();
            if (string.IsNullOrWhiteSpace(identityUserId))
                return Unauthorized();

            await service.CreateAsync(dto, identityUserId);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.USERS_ME)]
        [Authorize]
        public async Task<IActionResult> EditMeAsync([FromBody] UserEditDto dto)
        {
            string? identityUserId = GetCurrentIdentityUserId();
            if (string.IsNullOrWhiteSpace(identityUserId))
                return Unauthorized();

            var user = await databaseContext.Users
                .FirstOrDefaultAsync(u => u.IsActive && u.IdentityUserId == identityUserId);

            if (user == null)
                return NotFound("Nie znaleziono profilu użytkownika dla zalogowanego konta.");

            // nadpisujemy ID
            dto.Id = user.UserId;

            await service.EditAsync(dto);
            return Ok();
        }
    }
}
