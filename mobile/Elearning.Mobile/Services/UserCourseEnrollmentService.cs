using Elearning.Mobile.Dtos.UserCourseEnrollment;
using System.Net.Http.Json;

namespace Elearning.Mobile.Services;

public class UserCourseEnrollmentService
{
    private readonly ApiClient _apiClient;

    public UserCourseEnrollmentService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task CreateAsync(UserCourseEnrollmentCreateDto dto)
    {
        var http = await _apiClient.GetClientAsync();
        var res = await http.PostAsJsonAsync("/user-course-enrollments", dto);
        res.EnsureSuccessStatusCode();
    }

    public async Task<List<UserCourseEnrollmentDto>> GetMyAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<UserCourseEnrollmentDto>>("/user-course-enrollments/my");
        return data ?? [];
    }

    public async Task CompleteAsync(int enrollmentId)
    {
        var http = await _apiClient.GetClientAsync();
        var res = await http.PostAsync($"/user-course-enrollments/{enrollmentId}/complete", content: null);
        res.EnsureSuccessStatusCode();
    }
}
