using Data;
using Data.Dtos.Module;
using Elearning.API.Models.Contexts;
using Elearning.API.Services;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class ModulesController : BaseController
    {
        private readonly IModuleService service;
        private readonly IUserCourseAccessService userCourseAccessService;

        public ModulesController(IModuleService service, IUserCourseAccessService userCourseAccessService, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
            this.userCourseAccessService = userCourseAccessService;
        }

        [HttpPost]
        [Route(Urls.MODULES)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] ModuleCreateDto dto)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                var courseInfo = await service.GetCourseInfoForCourseAsync(dto.CourseId);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnego kursu powiązanego z tym modułem.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.MODULES_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] ModuleEditDto dto, int id)
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

                var courseInfo = await service.GetCourseInfoForModuleAsync(id);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnego modułu o podanym id.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.MODULES_ID)]
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

                var courseInfo = await service.GetCourseInfoForModuleAsync(id);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnego modułu o podanym id.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.MODULES)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.MODULES_ID)]
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

            var courseInfo = await service.GetCourseInfoForModuleAsync(id);
            if (courseInfo == null)
                return BadRequest("Nie znaleziono aktywnego modułu o podanym id.");

            var (courseId, tutorUserId) = courseInfo.Value;

            if (isTutor)
            {
                if (tutorUserId != currentUserId.Value)
                    return Forbid();

                return Json(await service.GetAsync(id));
            }

            if (isStudent)
            {
                bool hasAccess = await userCourseAccessService.StudentHasAccessToCourseAsync(currentUserId.Value, courseId);
                if (!hasAccess)
                    return Forbid();

                return Json(await service.GetAsync(id));
            }

            return Forbid();
        }

        [HttpGet]
        [Route(Urls.COURSE_MODULES)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetByCourseAsync(int courseId)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            if (isAdmin)
            {
                var adminResult = await service.GetAllForCourseAsync(courseId);
                return Json(adminResult);
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var courseInfo = await service.GetCourseInfoForCourseAsync(courseId);
            if (courseInfo == null)
                return BadRequest("Nie znaleziono aktywnego kursu o podanym id.");

            var (_, tutorUserId) = courseInfo.Value;

            if (isTutor)
            {
                if (tutorUserId != currentUserId.Value)
                    return Forbid();

                var tutorResult = await service.GetAllForCourseAsync(courseId);
                return Json(tutorResult);
            }

            if (isStudent)
            {
                bool hasAccess = await userCourseAccessService.StudentHasAccessToCourseAsync(currentUserId.Value, courseId);
                if (!hasAccess)
                    return Forbid();

                var studentResult = await service.GetAllForCourseAsync(courseId);
                return Json(studentResult);
            }

            return Forbid();
        }
    }
}
