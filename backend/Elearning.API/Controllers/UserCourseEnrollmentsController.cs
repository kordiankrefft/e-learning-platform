using Data;
using Data.Dtos.UserCourseEnrollment;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class UserCourseEnrollmentsController : BaseController
    {
        private readonly IUserCourseEnrollmentService service;

        public UserCourseEnrollmentsController(IUserCourseEnrollmentService service, DatabaseContext databaseContext)
            : base(databaseContext)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.USER_COURSE_ENROLLMENTS)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateAsync([FromBody] UserCourseEnrollmentCreateDto dto)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            await service.CreateAsync(dto, currentUserId.Value);
            return Ok();
        }

        //do ustawiania pola CompletedAt poprzez status
        [HttpPost]
        [Route(Urls.USER_COURSE_ENROLLMENTS_COMPLETE)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CompleteAsync(int id)
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var enrollment = await databaseContext.UserCourseEnrollments
                .Where(item => item.UserCourseEnrollmentId == id && item.IsActive)
                .Select(item => new { item.UserCourseEnrollmentId, item.UserId })
                .FirstOrDefaultAsync();

            if (enrollment == null)
                return NotFound("Nie znaleziono aktywnego zapisu na kurs o podanym id.");

            if (enrollment.UserId != currentUserId.Value)
                return Forbid();

            await service.MarkCompletedAsync(id);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.USER_COURSE_ENROLLMENTS_ID)]
        [Authorize(Roles = "Admin,Tutor")]
        public async Task<IActionResult> EditAsync([FromBody] UserCourseEnrollmentEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID w URL nie jest zgodne z ID w DTO.");

            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");

            if (isTutor && !isAdmin)
            {
                int? currentUserId = await GetCurrentUserIdAsync();
                if (currentUserId == null)
                    return Unauthorized();

                var enrollmentInfo = await databaseContext.UserCourseEnrollments
                    .Where(item => item.UserCourseEnrollmentId == id && item.IsActive)
                    .Select(item => new
                    {
                        item.UserCourseEnrollmentId,
                        TutorUserId = item.Course.TutorUserId
                    })
                    .FirstOrDefaultAsync();

                if (enrollmentInfo == null)
                    return NotFound("Nie znaleziono aktywnego zapisu na kurs o podanym id.");

                if (enrollmentInfo.TutorUserId != currentUserId.Value)
                    return Forbid();
            }

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.USER_COURSE_ENROLLMENTS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.USER_COURSE_ENROLLMENTS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.USER_COURSE_ENROLLMENTS_ID)]
        [Authorize(Roles = "Student,Tutor,Admin")]
        public async Task<IActionResult> GetAsync(int id)
        {
            bool isAdmin = User.IsInRole("Admin");
            bool isTutor = User.IsInRole("Tutor");
            bool isStudent = User.IsInRole("Student");

            if (isAdmin)
            {
                var adminDto = await service.GetAsync(id);
                return Json(adminDto);
            }

            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var enrollmentInfo = await databaseContext.UserCourseEnrollments
                .Where(item => item.UserCourseEnrollmentId == id && item.IsActive)
                .Select(item => new
                {
                    item.UserCourseEnrollmentId,
                    item.UserId,
                    item.CourseId,
                    TutorUserId = item.Course.TutorUserId
                })
                .FirstOrDefaultAsync();

            if (enrollmentInfo == null)
                return NotFound("Nie znaleziono aktywnego zapisu na kurs o podanym id.");

            if (isStudent)
            {
                if (enrollmentInfo.UserId != currentUserId.Value)
                    return Forbid();

                var dto = await service.GetAsync(id);
                return Json(dto);
            }

            if (isTutor)
            {
                if (enrollmentInfo.TutorUserId != currentUserId.Value)
                    return Forbid();

                var dto = await service.GetAsync(id);
                return Json(dto);
            }

            return Forbid();
        }

        [HttpGet]
        [Route(Urls.USER_COURSE_ENROLLMENTS_MY)]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyAsync()
        {
            int? currentUserId = await GetCurrentUserIdAsync();
            if (currentUserId == null)
                return Unauthorized();

            var result = await service.GetMyAsync(currentUserId.Value);
            return Json(result);
        }
    }
}
