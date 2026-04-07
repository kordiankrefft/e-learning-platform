using Data;
using Data.Dtos.Quiz;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class QuizzesController : BaseController
    {
        private readonly IQuizService service;
        private readonly IUserCourseAccessService userCourseAccessService;

        public QuizzesController(IQuizService service, IUserCourseAccessService userCourseAccessService, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
            this.userCourseAccessService = userCourseAccessService;
        }

        [HttpPost]
        [Route(Urls.QUIZZES)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] QuizCreateDto dto)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (!dto.LessonId.HasValue && !dto.ModuleId.HasValue)
            {
                return BadRequest("Quiz musi być przypisany do lekcji lub modułu.");
            }

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                int? courseTutorUserId = null;

                if (dto.LessonId.HasValue)
                {
                    var lessonWithCourse = await databaseContext.Lessons
                        .Where(item => item.LessonId == dto.LessonId.Value && item.IsActive)
                        .Select(item => new
                        {
                            item.LessonId,
                            TutorUserId = item.Module.Course.TutorUserId
                        })
                        .FirstOrDefaultAsync();

                    if (lessonWithCourse == null)
                        return BadRequest("Nie znaleziono aktywnej lekcji powiązanej z tym quizem.");

                    courseTutorUserId = lessonWithCourse.TutorUserId;
                }
                else if (dto.ModuleId.HasValue)
                {
                    var moduleWithCourse = await databaseContext.Modules
                        .Where(item => item.ModuleId == dto.ModuleId.Value && item.IsActive)
                        .Select(item => new
                        {
                            item.ModuleId,
                            TutorUserId = item.Course.TutorUserId
                        })
                        .FirstOrDefaultAsync();

                    if (moduleWithCourse == null)
                        return BadRequest("Nie znaleziono aktywnego modułu powiązanego z tym quizem.");

                    courseTutorUserId = moduleWithCourse.TutorUserId;
                }

                if (courseTutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.QUIZZES_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] QuizEditDto dto, int id)
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

                var (courseId, tutorUserId) = await service.GetQuizCourseInfoAsync(id);
                if (courseId == null || tutorUserId == null)
                    return BadRequest("Nie znaleziono aktywnego quizu o podanym id.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.QUIZZES_ID)]
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

                var (courseId, tutorUserId) = await service.GetQuizCourseInfoAsync(id);
                if (courseId == null || tutorUserId == null)
                    return BadRequest("Nie znaleziono aktywnego quizu o podanym id.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.QUIZZES)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            if (isAdmin)
                return Json(await service.GetAllAsync());

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null) return Unauthorized();

            if (isTutor)
                return Json(await service.GetAllForTutorAsync(currentUserId.Value));

            if (isStudent)
                return Json(await service.GetAllForStudentAsync(currentUserId.Value));

            return Forbid();
        }

        [HttpGet]
        [Route(Urls.QUIZZES_ID)]
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

            var (courseId, tutorUserId) = await service.GetQuizCourseInfoAsync(id);
            if (courseId == null || tutorUserId == null)
                return BadRequest("Nie znaleziono aktywnego quizu o podanym id.");

            if (isTutor)
            {
                if (tutorUserId != currentUserId.Value)
                    return Forbid();

                return Json(await service.GetAsync(id));
            }

            if (isStudent)
            {
                bool hasAccess = await userCourseAccessService
                    .StudentHasAccessToCourseAsync(currentUserId.Value, courseId.Value);

                if (!hasAccess)
                    return Forbid();

                return Json(await service.GetAsync(id));
            }

            return Forbid();
        }

        [HttpGet]
        [Route(Urls.MODULE_QUIZ)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetModuleQuizAsync(int moduleId)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            QuizDto? quiz = await service.GetModuleQuizAsync(moduleId);
            if (quiz == null)
                return BadRequest("Brak quizu dla tego modułu.");

            var (courseId, tutorUserId) = await service.GetQuizCourseInfoAsync(quiz.Id);
            if (courseId == null || tutorUserId == null)
                return BadRequest("Nie znaleziono aktywnego quizu powiązanego z kursem.");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null) return Unauthorized();
                if (tutorUserId.Value != currentUserId.Value) return Forbid();
            }

            if (isStudent && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null) return Unauthorized();

                bool hasAccess = await userCourseAccessService
                    .StudentHasAccessToCourseAsync(currentUserId.Value, courseId.Value);

                if (!hasAccess) return Forbid();

                bool hasPassed = await databaseContext.QuizAttempts.AnyAsync(item =>
                        item.IsActive &&
                        item.UserId == currentUserId.Value &&
                        item.QuizId == quiz.Id &&
                        item.SubmittedAt != null &&
                        item.Passed == true
                 );

                quiz.StudentPassed = hasPassed;
            }

            return Json(quiz);
        }


        // jeden endpoint do rozwiązywania quizu (questions + options bez IsCorrect)
        [HttpGet]
        [Route(Urls.QUIZ_TAKE)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetQuizTakeAsync(int quizId)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            var (courseId, tutorUserId) = await service.GetQuizCourseInfoAsync(quizId);
            if (courseId == null || tutorUserId == null)
                return BadRequest("Nie znaleziono aktywnego quizu powiązanego z kursem.");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null) return Unauthorized();
                if (tutorUserId.Value != currentUserId.Value) return Forbid();
            }

            if (isStudent && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null) return Unauthorized();

                bool hasAccess = await userCourseAccessService
                    .StudentHasAccessToCourseAsync(currentUserId.Value, courseId.Value);

                if (!hasAccess) return Forbid();
            }

            QuizTakeDto? dto = await service.GetQuizTakeAsync(quizId);
            if (dto == null) return BadRequest("Nie znaleziono quizu lub pytań.");

            return Json(dto);
        }

    }
}
