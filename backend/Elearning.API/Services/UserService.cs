using Data.Dtos.User;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class UserService : BaseService, IUserService
    {
        private readonly UserManager<IdentityUser> userManager;

        public UserService(DatabaseContext databaseContext, UserManager<IdentityUser> userManager)
            : base(databaseContext)
        {
            this.userManager = userManager;
        }

        // zapewnij rekord w tabeli Users (bez profilu)
        public async Task<User> EnsureUserExistsAsync(string identityUserId)
        {
            User? user = await databaseContext.Users
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);

            if (user != null)
                return user;

            user = new User
            {
                IdentityUserId = identityUserId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
                UserProfile = null
            };

            databaseContext.Users.Add(user);
            await databaseContext.SaveChangesAsync();

            return user;
        }

        // Jeśli user istnieje bez profilu -> tylko dodaj UserProfile
        public async Task CreateAsync(UserCreateDto dto, string identityUserId)
        {
            // rekord User istnieje
            User user = await EnsureUserExistsAsync(identityUserId);

            // jeśli już ma profil -> nie pozwalamy tworzyć drugi raz
            if (user.UserProfile != null)
                throw new Exception("Użytkownik ma już utworzony profil.");

            // utwórz profil
            user.UserProfile = new UserProfile
            {
                UserId = user.UserId,
                DisplayName = dto.DisplayName,
                PreferredLanguage = dto.PreferredLanguage,
                Bio = dto.Bio
            };

            user.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(UserEditDto dto)
        {
            User user = databaseContext.Users
                .Include(item => item.UserProfile)
                .FirstOrDefault(item => item.UserId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego użytkownika o id {dto.Id}.");

            user.UpdatedAt = DateTime.UtcNow;

            if (user.UserProfile == null)
                user.UserProfile = new UserProfile { UserId = user.UserId };

            user.UserProfile.DisplayName = dto.DisplayName;
            user.UserProfile.PreferredLanguage = dto.PreferredLanguage;
            user.UserProfile.Bio = dto.Bio;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            User user = databaseContext.Users
                .FirstOrDefault(item => item.UserId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego użytkownika o id {id}.");

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<UserAdminDto>> GetAllAsync()
        {
            List<User> items = await databaseContext.Users
                .Include(item => item.UserProfile)
                .Where(item => item.IsActive)
                .ToListAsync();

            List<UserAdminDto> dtos = new();

            foreach (User item in items)
            {
                IdentityUser? identityUser =
                    await userManager.FindByIdAsync(item.IdentityUserId);

                if (identityUser == null)
                    continue;

                IList<string> roles =
                    await userManager.GetRolesAsync(identityUser);

                dtos.Add(new UserAdminDto
                {
                    Id = item.UserId,
                    IdentityUserId = item.IdentityUserId,
                    Email = identityUser.Email!,
                    Roles = roles.ToList(),
                    DisplayName = item.UserProfile?.DisplayName,
                    PreferredLanguage = item.UserProfile?.PreferredLanguage,
                    Bio = item.UserProfile?.Bio,
                    IsActive = item.IsActive,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                });
            }

            return dtos;
        }

        public async Task<UserDto> GetAsync(int id)
        {
            UserDto dto = await databaseContext.Users
                .Where(item => item.IsActive && item.UserId == id)
                .Select(item => new UserDto()
                {
                    Id = item.UserId,
                    DisplayName = item.UserProfile!.DisplayName,
                    PreferredLanguage = item.UserProfile.PreferredLanguage,
                    Bio = item.UserProfile.Bio,
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego użytkownika o id {id}.");

            return dto;
        }

        public async Task<UserAdminDto> GetAdminAsync(int id)
        {
            User item = await databaseContext.Users
                .Include(item => item.UserProfile)
                .FirstOrDefaultAsync(item => item.IsActive && item.UserId == id)
                ?? throw new Exception($"Nie odnaleziono użytkownika o id {id}.");

            IdentityUser identityUser =
                await userManager.FindByIdAsync(item.IdentityUserId)
                ?? throw new Exception("Nie odnaleziono użytkownika Identity.");

            IList<string> roles =
                await userManager.GetRolesAsync(identityUser);

            return new UserAdminDto
            {
                Id = item.UserId,
                IdentityUserId = item.IdentityUserId,
                Email = identityUser.Email!,
                Roles = roles.ToList(),
                DisplayName = item.UserProfile?.DisplayName,
                PreferredLanguage = item.UserProfile?.PreferredLanguage,
                Bio = item.UserProfile?.Bio,
                IsActive = item.IsActive,
            };
        }
    }
}
