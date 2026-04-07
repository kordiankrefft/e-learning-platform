using Data;
using Data.Dtos.LessonContentBlock;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class LessonContentBlocksController : BaseController
    {
        private readonly ILessonContentBlockService service;
        private readonly IUserCourseAccessService userCourseAccessService;

        public LessonContentBlocksController(ILessonContentBlockService service, IUserCourseAccessService userCourseAccessService, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
            this.userCourseAccessService = userCourseAccessService;
        }

        [HttpPost]
        [Route(Urls.LESSON_CONTENT_BLOCKS)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] LessonContentBlockCreateDto dto)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                var courseInfo = await service.GetCourseInfoForLessonAsync(dto.LessonId);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnej lekcji powiązanej z tym blokiem.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.LESSON_CONTENT_BLOCKS_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] LessonContentBlockEditDto dto, int id)
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

                var courseInfo = await service.GetCourseInfoForContentBlockAsync(id);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnego bloku treści o podanym id.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.LESSON_CONTENT_BLOCKS_ID)]
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

                var courseInfo = await service.GetCourseInfoForContentBlockAsync(id);
                if (courseInfo == null)
                    return BadRequest("Nie znaleziono aktywnego bloku treści o podanym id.");

                var (_, tutorUserId) = courseInfo.Value;
                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.LESSON_CONTENT_BLOCKS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.LESSON_CONTENT_BLOCKS_ID)]
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

            var courseInfo = await service.GetCourseInfoForContentBlockAsync(id);
            if (courseInfo == null)
                return BadRequest("Nie znaleziono aktywnego bloku treści o podanym id.");

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

        // LISTA BLOKÓW DLA LEKCJI
        [HttpGet]
        [Route(Urls.LESSON_CONTENT_BLOCKS_FOR_LESSON)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetByLessonAsync(int lessonId)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            if (isAdmin)
            {
                var adminResult = await service.GetAllForLessonAsync(lessonId);
                return Json(adminResult);
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var courseInfo = await service.GetCourseInfoForLessonAsync(lessonId);
            if (courseInfo == null)
                return BadRequest("Nie znaleziono aktywnej lekcji o podanym id.");

            var (courseId, tutorUserId) = courseInfo.Value;

            if (isTutor)
            {
                if (tutorUserId != currentUserId.Value)
                    return Forbid();

                var tutorResult = await service.GetAllForLessonAsync(lessonId);
                return Json(tutorResult);
            }

            if (isStudent)
            {
                bool hasAccess = await userCourseAccessService.StudentHasAccessToCourseAsync(currentUserId.Value, courseId);
                if (!hasAccess)
                    return Forbid();

                var studentResult = await service.GetAllForLessonAsync(lessonId);
                return Json(studentResult);
            }

            return Forbid();
        }
    }
}
