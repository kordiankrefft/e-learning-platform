using Data;
using Data.Dtos.QuizAttemptAnswer;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class QuizAttemptAnswersController : BaseController
    {
        private readonly IQuizAttemptAnswerService service;

        public QuizAttemptAnswersController(IQuizAttemptAnswerService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.QUIZ_ATTEMPT_ANSWERS_FOR_ATTEMPT)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateAsync([FromBody] QuizAttemptAnswerCreateDto dto, int attemptId)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var attempt = await databaseContext.QuizAttempts
                .FirstOrDefaultAsync(item => item.QuizAttemptId == attemptId && item.IsActive);

            if (attempt == null)
                return BadRequest("Nie znaleziono aktywnego podejścia o podanym id.");

            if (attempt.UserId != currentUserId.Value)
                return Forbid();

            if (attempt.SubmittedAt != null)
                return BadRequest("To podejście zostało już zakończone.");

            await service.CreateAsync(dto, attemptId);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.QUIZ_ATTEMPT_ANSWERS_ID)]
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

                var (courseId, attemptUserId, tutorUserId) = await service.GetAnswerCourseInfoAsync(id);
                if (courseId == null || tutorUserId == null)
                    return BadRequest("Nie znaleziono aktywnej odpowiedzi o podanym id.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.QUIZ_ATTEMPT_ANSWERS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.QUIZ_ATTEMPT_ANSWERS_ID)]
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

            var (courseId, attemptUserId, tutorUserId) = await service.GetAnswerCourseInfoAsync(id);
            if (courseId == null)
                return BadRequest("Nie znaleziono aktywnej odpowiedzi o podanym id.");

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
