using Data;
using Data.Dtos.CoursePricingPlan;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    public class CoursePricingPlansController : Controller
    {
        private readonly ICoursePricingPlanService service;

        public CoursePricingPlansController(ICoursePricingPlanService service)
        {
            this.service = service;
        }

        [HttpPost]
        [Route(Urls.COURSE_PRICING_PLANS)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAsync([FromBody] CoursePricingPlanCreateDto dto)
        {
            await service.CreateAsync(dto);
            return Ok();
        }

        [HttpPut]
        [Route(Urls.COURSE_PRICING_PLANS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditAsync([FromBody] CoursePricingPlanEditDto dto, int id)
        {
            if (dto.Id != id)
                return BadRequest("ID in URL does not match DTO ID.");

            await service.EditAsync(dto);
            return Ok();
        }

        [HttpDelete]
        [Route(Urls.COURSE_PRICING_PLANS_ID)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }

        [HttpGet]
        [Route(Urls.COURSE_PRICING_PLANS)]
        public async Task<IActionResult> GetAllAsync()
        {
            return Json(await service.GetAllAsync());
        }

        [HttpGet]
        [Route(Urls.COURSE_PRICING_PLANS_ID)]
        public async Task<IActionResult> GetAsync(int id)
        {
            return Json(await service.GetAsync(id));
        }
    }
}
