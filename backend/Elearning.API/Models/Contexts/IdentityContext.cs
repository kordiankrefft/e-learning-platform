using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models.Contexts
{
    public class IdentityContext : IdentityDbContext<IdentityUser>
    {
       public IdentityContext(DbContextOptions<IdentityContext> options) : base(options) 
        { 
        }
    }
}
