using System.Net;
using System.Net.Http.Json;
using Elearning.Mobile.Dtos.User;

namespace Elearning.Mobile.Services;

public class UserService
{
    private readonly ApiClient _apiClient;

    public UserService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<UserDto?> GetMeAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var res = await http.GetAsync("/users/me");

        if (res.StatusCode == HttpStatusCode.Unauthorized) return null;
        if (res.StatusCode == HttpStatusCode.NotFound) return null;

        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<UserDto>();
    }

    public async Task CreateMeAsync(UserCreateDto dto)
    {
        var http = await _apiClient.GetClientAsync();
        var res = await http.PostAsJsonAsync("/users/me", dto);
        res.EnsureSuccessStatusCode();
    }

    public async Task EditMeAsync(UserEditDto dto)
    {
        var http = await _apiClient.GetClientAsync();
        var res = await http.PutAsJsonAsync("/users/me", dto);
        res.EnsureSuccessStatusCode();
    }
}
