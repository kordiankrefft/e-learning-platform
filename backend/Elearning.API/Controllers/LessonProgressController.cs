using Data;
using Data.Dtos.LessonProgress;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class LessonProgressController : BaseController
    {
        private readonly ILessonProgressService service;
        private readonly IUserCourseAccessService userCourseAccessService;

        public LessonProgressController(ILessonProgressService service, IUserCourseAccessService userCourseAccessService, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
            this.userCourseAccessService = userCourseAccessService;
        }

        [HttpPost]
        [Route(Urls.LESSON_PROGRESS)]
        [Authorize(Roles = "Student,Admin")]
        public async Task<IActionResult> CreateAsync([FromBody] LessonProgressCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            bool isStudent = User.IsInRole("Student");

            int? courseId = await service.GetCourseIdForLessonAsync(dto.LessonId);
            if (courseId == null)
                return BadRequest("Nie znaleziono aktywnej lekcji powiązanej z tym postępem.");

            if (isStudent && !isAdmin)
            {
                bool hasAccess = await userCourseAccessService.StudentHasAccessToCourseAsync(currentUserId.Value, courseId.Value);

                if (!hasAccess)
                    return Forbid();
            }

            await service.CreateAsync(dto, currentUserId.Value);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.LESSON_PROGRESS)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            if (isAdmin)
            {
                return Json(await service.GetAllAsync());
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            if (isStudent)
            {
                return Json(await service.GetAllForUserAsync(currentUserId.Value));
            }

            if (isTutor)
            {
                return Json(await service.GetAllForTutorAsync(currentUserId.Value));
            }

            return Forbid();
        }

        [HttpGet]
        [Route(Urls.LESSON_PROGRESS_ID)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            if (isAdmin)
            {
                return Json(await service.GetAsync(id));
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var accessInfo = await service.GetProgressAccessInfoAsync(id);
            if (accessInfo == null)
                return BadRequest("Nie znaleziono aktywnego postępu lekcji o podanym id.");

            var (ownerUserId, courseId, tutorUserId) = accessInfo.Value;

            if (isStudent)
            {
                if (ownerUserId != currentUserId.Value)
                    return Forbid();

                return Json(await service.GetAsync(id));
            }

            if (isTutor)
            {
                if (tutorUserId != currentUserId.Value)
                    return Forbid();

                return Json(await service.GetAsync(id));
            }

            return Forbid();
        }

        [HttpDelete]
        [Route(Urls.LESSON_PROGRESS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }
    }
}
