using System.Net.Http.Json;
using Elearning.Mobile.Dtos.UserCourseAccess;

namespace Elearning.Mobile.Services;

public class UserCourseAccessService
{
    private readonly ApiClient _apiClient;

    public UserCourseAccessService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task CreateAsync(UserCourseAccessCreateDto dto)
    {
        var http = await _apiClient.GetClientAsync();
        var res = await http.PostAsJsonAsync("/user-course-accesses", dto);
        res.EnsureSuccessStatusCode();
    }

    public async Task<List<UserCourseAccessDto>> GetMyAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<UserCourseAccessDto>>("/user-course-accesses/my");
        return data ?? [];
    }
}
