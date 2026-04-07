using Data;
using Data.Dtos.UserCourseAccess;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class UserCourseAccessesController : BaseController
    {
        private readonly IUserCourseAccessService service;

        public UserCourseAccessesController(IUserCourseAccessService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.USER_COURSE_ACCESSES)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateAsync([FromBody] UserCourseAccessCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            await service.CreateAsync(dto, currentUserId.Value);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.USER_COURSE_ACCESSES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditAsync([FromBody] UserCourseAccessEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID w URL nie jest zgodne z ID w DTO.");

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.USER_COURSE_ACCESSES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.USER_COURSE_ACCESSES)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.USER_COURSE_ACCESSES_ID)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            if (isAdmin)
            {
                var adminDto = await service.GetAsync(id);
                return Json(adminDto);
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var accessInfo = await databaseContext.UserCourseAccesses
                .Where(item => item.IsActive && item.UserCourseAccessId == id)
                .Select(item => new
                {
                    item.UserCourseAccessId,
                    item.UserId,
                    item.CourseId,
                    TutorUserId = item.Course.TutorUserId
                })
                .FirstOrDefaultAsync();

            if (accessInfo == null)
                return NotFound("Nie znaleziono aktywnego dostępu o podanym id.");

            if (isStudent)
            {
                if (accessInfo.UserId != currentUserId.Value)
                    return Forbid();

                var dto = await service.GetAsync(id);
                return Json(dto);
            }

            if (isTutor)
            {
                if (accessInfo.TutorUserId != currentUserId.Value)
                    return Forbid();

                var dto = await service.GetAsync(id);
                return Json(dto);
            }

            return Forbid();
        }

        [HttpGet]
        [Route(Urls.USER_COURSE_ACCESSES_MY)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyAsync()
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var result = await service.GetMyAsync(currentUserId.Value);
            return Json(result);
        }
    }
}
