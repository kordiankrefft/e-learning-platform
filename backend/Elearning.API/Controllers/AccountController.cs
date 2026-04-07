using Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [ApiController]
    [Authorize] 
    public class AccountController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;

        public AccountController(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        [Route(Urls.MY_ROLES)]
        public async Task<ActionResult<IList<string>>> GetMyRoles()
        {
            var identityUser = await _userManager.GetUserAsync(User);
            if (identityUser == null)
            {
                return Unauthorized();
            }

            var roles = await _userManager.GetRolesAsync(identityUser);
            return Ok(roles); 
        }
    }
}
