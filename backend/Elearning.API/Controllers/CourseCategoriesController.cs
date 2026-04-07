using Data;
using Data.Dtos.CourseCategory;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class CourseCategoriesController : Controller
    {
        private readonly ICourseCategoryService service;

        public CourseCategoriesController(ICourseCategoryService service)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.COURSE_CATEGORIES)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAsync([FromBody] CourseCategoryCreateDto dto)
        {
            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.COURSE_CATEGORIES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditAsync([FromBody] CourseCategoryEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID in URL does not match DTO ID.");

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.COURSE_CATEGORIES_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.COURSE_CATEGORIES)]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await service.GetAllAsync();
            return Json(result);
        }

        [HttpGet]
        [Route(Urls.COURSE_CATEGORIES_ID)]
        public async Task<IActionResult> GetAsync(int id)
        {
            var result = await service.GetAsync(id);
            return Json(result);
        }
    }
}
