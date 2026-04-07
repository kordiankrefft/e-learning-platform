using Data;
using Data.Dtos.QuizAttempt;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class QuizAttemptsController : BaseController
    {
        private readonly IQuizAttemptService service;
        private readonly IUserCourseAccessService userCourseAccessService;

        public QuizAttemptsController(IQuizAttemptService service, DatabaseContext databaseContext, IUserCourseAccessService userCourseAccessService)
            : base(databaseContext)
        {
            this.service = service;
            this.userCourseAccessService = userCourseAccessService;
        }

        [HttpPost]
        [Route(Urls.QUIZ_ATTEMPTS)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateAsync([FromBody] QuizAttemptCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            // sprawdzamy, czy quiz istnieje i do jakiego kursu należy
            var quizInfo = await databaseContext.Quizzes
                .Where(item => item.QuizId == dto.QuizId && item.IsActive)
                .Select(item => new
                {
                    LessonCourseId = item.Lesson != null
                        ? (int?)item.Lesson.Module.CourseId
                        : null,
                    ModuleCourseId = item.Module != null
                        ? (int?)item.Module.CourseId
                        : null
                })
                .FirstOrDefaultAsync();

            if (quizInfo == null)
                return BadRequest("Nie znaleziono aktywnego quizu o podanym id.");

            int? courseId = quizInfo.LessonCourseId ?? quizInfo.ModuleCourseId;

            if (courseId == null)
                return BadRequest("Quiz nie jest poprawnie powiązany z kursem.");

            bool hasAccess = await userCourseAccessService
                .StudentHasAccessToCourseAsync(currentUserId.Value, courseId.Value);

            if (!hasAccess)
                return Forbid();

            int attemptId;
            try
            {
                attemptId = await service.CreateAsync(dto, currentUserId.Value);
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }

            return Json(new { attemptId });
        }

        [HttpPut]
        [Route(Urls.QUIZ_ATTEMPTS_ID)]
        [Authorize(Roles = "Student,Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] QuizAttemptEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID in URL does not match DTO ID.");

            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var (courseId, attemptUserId, tutorUserId) = await service.GetAttemptCourseInfoAsync(id);
            if (courseId == null)
                return BadRequest("Nie znaleziono aktywnego podejścia powiązanego z kursem.");

            if (isTutor && !isAdmin)
            {
                if (tutorUserId == null)
                    return BadRequest("Nie znaleziono danych tutora dla tego podejścia.");

                if (tutorUserId.Value != currentUserId.Value)
                    return Forbid();
            }

            if (isStudent && !isAdmin && !isTutor)
            {
                if (attemptUserId != currentUserId.Value)
                    return Forbid();

                bool hasAccess = await userCourseAccessService
                    .StudentHasAccessToCourseAsync(currentUserId.Value, courseId.Value);

                if (!hasAccess)
                    return Forbid();

                QuizAttemptDto resultDto;
                try
                {
                    await service.SubmitAndScoreAsync(id, currentUserId.Value);
                    resultDto = await service.GetAsync(id);
                }
                catch (Exception exception)
                {
                    return BadRequest(exception.Message);
                }

                return Json(resultDto);
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.QUIZ_ATTEMPTS_ID)]
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

                var (courseId, attemptUserId, tutorUserId) = await service.GetAttemptCourseInfoAsync(id);
                if (courseId == null || tutorUserId == null)
                    return BadRequest("Nie znaleziono aktywnego podejścia powiązanego z kursem.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.QUIZ_ATTEMPTS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.QUIZ_ATTEMPTS_ID)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            if (isAdmin)
            {
                var resultAdmin = await service.GetAsync(id);
                return Json(resultAdmin);
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var (courseId, attemptUserId, tutorUserId) = await service.GetAttemptCourseInfoAsync(id);
            if (courseId == null)
                return BadRequest("Nie znaleziono aktywnego podejścia o podanym id.");

            if (isTutor)
            {
                if (tutorUserId == null || tutorUserId != currentUserId.Value)
                    return Forbid();

                var resultTutor = await service.GetAsync(id);
                return Json(resultTutor);
            }

            if (isStudent)
            {
                if (attemptUserId != currentUserId.Value)
                    return Forbid();

                var resultStudent = await service.GetAsync(id);
                return Json(resultStudent);
            }

            return Forbid();
        }
    }
}
