using Data.Dtos.User;
using Elearning.API.Models;

namespace Elearning.API.Services.Interfaces
{
    public interface IUserService
    {
        Task CreateAsync(UserCreateDto dto, string identityUserId);
        Task EditAsync(UserEditDto dto);  
        Task DeleteAsync(int id);
        Task<List<UserAdminDto>> GetAllAsync();
        Task<UserDto> GetAsync(int id);

        Task<User> EnsureUserExistsAsync(string identityUserId);

        Task<UserAdminDto> GetAdminAsync(int id);

    }
}
