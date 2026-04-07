using Data;
using Data.Dtos.QuizQuestion;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class QuizQuestionsController : BaseController
    {
        private readonly IQuizQuestionService service;

        public QuizQuestionsController(IQuizQuestionService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.QUIZ_QUESTIONS)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] QuizQuestionCreateDto dto)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                var (courseId, tutorId) = await service.GetCourseInfoForQuizAsync(dto.QuizId);
                if (courseId == null || tutorId == null)
                    return BadRequest("Nie znaleziono powiązanego kursu dla tego quizu.");

                if (tutorId != currentUserId.Value)
                    return Forbid();
            }

            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.QUIZ_QUESTIONS_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] QuizQuestionEditDto dto, int id)
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

                var (courseId, tutorUserId) = await service.GetQuestionCourseInfoAsync(id);
                if (courseId == null || tutorUserId == null)
                    return BadRequest("Nie znaleziono aktywnego pytania o podanym id.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.QUIZ_QUESTIONS_ID)]
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

                var (courseId, tutorUserId) = await service.GetQuestionCourseInfoAsync(id);
                if (courseId == null || tutorUserId == null)
                    return BadRequest("Nie znaleziono aktywnego pytania o podanym id.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.QUIZ_QUESTIONS)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> GetAllAsync()
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isAdmin)
            {
                return Json(await service.GetAllAsync());
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            if (isTutor)
            {
                return Json(await service.GetAllForTutorAsync(currentUserId.Value));
            }

            return Forbid();
        }

        [HttpGet]
        [Route(Urls.QUIZ_QUESTIONS_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> GetAsync(int id)
        {
            bool isAdmin = User.IsInRole("Admin");
            if (isAdmin)
            {
                var resultAdmin = await service.GetAsync(id);
                return Json(resultAdmin);
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var (courseId, tutorUserId) = await service.GetQuestionCourseInfoAsync(id);
            if (courseId == null || tutorUserId == null)
                return BadRequest("Nie znaleziono aktywnego pytania o podanym id.");

            if (tutorUserId != currentUserId.Value)
                return Forbid();

            var resultTutor = await service.GetAsync(id);
            return Json(resultTutor);
        }
    }
}
