using Data;
using Data.Dtos.Lesson;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class LessonsController : BaseController
    {
        private readonly ILessonService service;
        private readonly IUserCourseAccessService userCourseAccessService;

        public LessonsController(ILessonService service, IUserCourseAccessService userCourseAccessService, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
            this.userCourseAccessService = userCourseAccessService;
        }

        [HttpPost]
        [Route(Urls.LESSONS)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] LessonCreateDto dto)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                var courseInfo = await service.GetCourseInfoForModuleAsync(dto.ModuleId);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono modułu powiązanego z tą lekcją.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid(); 
            }

            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.LESSONS_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] LessonEditDto dto, int id)
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

                var courseInfo = await service.GetCourseInfoForLessonAsync(id);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnej lekcji o podanym id.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.LESSONS_ID)]
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

                var courseInfo = await service.GetCourseInfoForLessonAsync(id);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnej lekcji o podanym id.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.LESSONS_ID)]
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

            if (isTutor)
            {
                var courseInfo = await service.GetCourseInfoForLessonAsync(id);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnej lekcji o podanym id.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();

                return Json(await service.GetAsync(id));
            }

            if (isStudent)
            {
                LessonDto dto = await service.GetForStudentAsync(id, currentUserId.Value);
                return Json(dto);
            }

            return Forbid();
        }

        [HttpGet]
        [Route(Urls.LESSONS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            return Json(await service.GetAllAsync());
        }

        [HttpGet]
        [Route(Urls.MODULE_LESSONS)] 
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetByModuleAsync(int moduleId)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            var moduleInfo = await databaseContext.Modules
                .Where(m => m.IsActive && m.ModuleId == moduleId)
                .Select(m => new { m.CourseId, TutorUserId = m.Course.TutorUserId })
                .FirstOrDefaultAsync();

            if (moduleInfo == null)
                return BadRequest("Nie znaleziono aktywnego modułu o podanym id.");

            int courseId = moduleInfo.CourseId;

            if (!isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                if (isTutor)
                {
                    if (moduleInfo.TutorUserId != currentUserId.Value)
                        return Forbid();
                }

                if (isStudent)
                {
                    bool hasAccess = await userCourseAccessService.StudentHasAccessToCourseAsync(currentUserId.Value, courseId);
                    if (!hasAccess)
                        return Forbid();
                }
            }

            List<LessonDto> lessons = await service.GetAllForModuleAsync(moduleId);
            return Json(lessons);
        }

    }
}
