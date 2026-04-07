using Data;
using Data.Dtos.AuditLog;
using Data.Dtos.Common;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService service;

        public AuditLogsController(IAuditLogService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route(Urls.AUDIT_LOGS)]
        public async Task<ActionResult<PagedSlice<AuditLogDto>>> GetPagedAsync(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await service.GetPagedSliceAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet]
        [Route(Urls.AUDIT_LOGS_ID)]
        public async Task<IActionResult> GetAsync(int id)
        {
            var result = await service.GetAsync(id);
            return Ok(result);
        }

        [HttpDelete]
        [Route(Urls.AUDIT_LOGS_ID)]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await service.DeleteAsync(id);
            return Ok();
        }
    }
}
