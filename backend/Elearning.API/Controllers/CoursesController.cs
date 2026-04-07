using Data;
using Data.Dtos.Course;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class CoursesController : BaseController
    {
        private readonly ICourseService service;

        public CoursesController(ICourseService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.COURSES)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] CourseCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            int tutorUserId;

            if (isAdmin)
            {
                if (dto.TutorUserId == null)
                    return BadRequest("Admin must specify tutorUserId when creating a course.");

                tutorUserId = dto.TutorUserId.Value;
            }
            else
            {
                if (dto.TutorUserId != null && dto.TutorUserId != currentUserId.Value)
                    return Forbid();
                tutorUserId = currentUserId.Value;
            }

            await service.CreateAsync(dto, tutorUserId);

            return Ok();
        }


        [HttpPut]
        [Route(Urls.COURSES_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] CourseEditDto dto, int id)
        {
            if (dto.Id != id)
            {
                return BadRequest();
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");

            CourseDto course = await service.GetAsync(id);

            if (!isAdmin && course.TutorUserId != currentUserId.Value)
            {
                return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.COURSES_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");

            CourseDto course = await service.GetAsync(id);

            if (!isAdmin && course.TutorUserId != currentUserId.Value)
            {
                return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.COURSES)]
        public async Task<IActionResult> GetAllAsync()
        {
            return Json(await service.GetAllAsync());
        }

        [HttpGet]
        [Route(Urls.COURSES_ID)]
        public async Task<IActionResult> GetAsync(int id)
        {
            return Json(await service.GetAsync(id));
        }

        [HttpGet]
        [Route(Urls.COURSES_MY_TUTOR)]
        [Authorize(Roles = "Tutor")]
        public async Task<IActionResult> GetMyTutorCoursesAsync()
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            return Json(await service.GetAllForTutorAsync(currentUserId.Value));
        }
    }
}
