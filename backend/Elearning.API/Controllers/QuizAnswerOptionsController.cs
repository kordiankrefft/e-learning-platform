using Data;
using Data.Dtos.QuizAnswerOption;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class QuizAnswerOptionsController : BaseController
    {
        private readonly IQuizAnswerOptionService service;

        public QuizAnswerOptionsController(IQuizAnswerOptionService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.QUIZ_ANSWER_OPTIONS)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> CreateAsync([FromBody] QuizAnswerOptionCreateDto dto)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                // Sprawdzamy, do jakiego kursu należy pytanie i czy tutor jest jego opiekunem
                var questionInfo = await databaseContext.QuizQuestions
                    .Where(item => item.QuizQuestionId == dto.QuizQuestionId && item.IsActive)
                    .Select(item => new
                    {
                        item.QuizQuestionId,
                        LessonTutorId = item.Quiz.Lesson != null
                            ? (int?)item.Quiz.Lesson.Module.Course.TutorUserId
                            : null,
                        ModuleTutorId = item.Quiz.Module != null
                            ? (int?)item.Quiz.Module.Course.TutorUserId
                            : null
                    })
                    .FirstOrDefaultAsync();

                if (questionInfo == null)
                    return BadRequest("Nie znaleziono aktywnego pytania powiązanego z tą odpowiedzią.");

                int? tutorUserId = questionInfo.LessonTutorId ?? questionInfo.ModuleTutorId;

                if (tutorUserId == null)
                    return BadRequest("Pytanie nie jest poprawnie powiązane z kursem.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.QUIZ_ANSWER_OPTIONS_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] QuizAnswerOptionEditDto dto, int id)
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

                var (courseId, tutorUserId) = await service.GetOptionCourseInfoAsync(id);
                if (courseId == null || tutorUserId == null)
                    return BadRequest("Nie znaleziono aktywnej opcji odpowiedzi powiązanej z kursem.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.QUIZ_ANSWER_OPTIONS_ID)]
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

                var (courseId, tutorUserId) = await service.GetOptionCourseInfoAsync(id);
                if (courseId == null || tutorUserId == null)
                    return BadRequest("Nie znaleziono aktywnej opcji odpowiedzi powiązanej z kursem.");

                if (tutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.QUIZ_ANSWER_OPTIONS)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> GetAllAsync()
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isAdmin)
            {
                var result = await service.GetAllAsync();
                return Json(result);
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            if (isTutor)
            {
                var result = await service.GetAllForTutorAsync(currentUserId.Value);
                return Json(result);
            }

            return Forbid();
        }


        [HttpGet]
        [Route(Urls.QUIZ_ANSWER_OPTIONS_ID)]
        [Authorize(Roles = "Tutor,Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isAdmin)
            {
                var resultAdmin = await service.GetAsync(id);
                return Json(resultAdmin);
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var (courseId, tutorUserId) = await service.GetOptionCourseInfoAsync(id);
            if (courseId == null || tutorUserId == null)
                return BadRequest("Nie znaleziono aktywnej opcji odpowiedzi o podanym id.");

            if (tutorUserId != currentUserId.Value)
                return Forbid();

            var resultTutor = await service.GetAsync(id);
            return Json(resultTutor);
        }
    }
}
