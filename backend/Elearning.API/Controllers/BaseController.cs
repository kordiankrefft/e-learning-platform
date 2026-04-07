using System.Security.Claims;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers
{
    [ApiController]
    public abstract class BaseController : Controller
    {
        protected readonly DatabaseContext databaseContext;

        protected BaseController(DatabaseContext databaseContext)
        {
            this.databaseContext = databaseContext;
        }

        protected string? GetCurrentIdentityUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        protected async Task<User?> GetCurrentUserEntityAsync()
        {
            string? identityUserId = GetCurrentIdentityUserId();
            if (string.IsNullOrWhiteSpace(identityUserId))
                return null;

            return await databaseContext.Users
                .Include(item => item.UserProfile)
                .FirstOrDefaultAsync(item => item.IsActive && item.IdentityUserId == identityUserId);
        }

        protected async Task<int?> GetCurrentUserIdAsync()
        {
            var user = await GetCurrentUserEntityAsync();
            return user?.UserId;
        }
    }
}
