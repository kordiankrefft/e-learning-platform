using Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    public class IdentityController : Controller
    {
        public RoleManager<IdentityRole> RoleManger { get; set; }
        public UserManager<IdentityUser> UserManager { get; set; }

        public IdentityController(RoleManager<IdentityRole> roleManger, UserManager<IdentityUser> userManager)
        {
            RoleManger = roleManger;
            UserManager = userManager;
        }

        [HttpGet]
        [Route(Urls.IDENTITY_CREATE_ROLE)]
        public async Task<IActionResult> CreateRole(string name)
        {
            if (!await RoleManger.RoleExistsAsync(name))
            {
                await RoleManger.CreateAsync(new IdentityRole(name));
            }
            return Ok();
        }

        [HttpGet]
        [Route(Urls.IDENTITY_ADD_USER_TO_ROLE)]
        public async Task<IActionResult> AddUserToRole(string email, string roleName)
        {
            IdentityUser? identityUser = await UserManager.FindByEmailAsync(email);
            if (!await RoleManger.RoleExistsAsync(roleName))
            {
                throw new ArgumentException($"Invalid role name: {roleName}");
            }
            if (identityUser != null)
            {
                if (!await UserManager.IsInRoleAsync(identityUser, roleName))
                {
                    await UserManager.AddToRoleAsync(identityUser, roleName);
                }
            }
            else
            {
                throw new ArgumentException($"Invalid user email: {email}");
            }
            return Ok();
        }
    }
}
