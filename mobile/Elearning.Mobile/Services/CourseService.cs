using System.Net.Http.Json;
using Elearning.Mobile.Dtos.Course;

namespace Elearning.Mobile.Services;

public class CourseService
{
    private readonly ApiClient _apiClient;
    public CourseService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<CourseDto>> GetAllAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<CourseDto>>("/courses");
        return data ?? [];
    }

    public async Task<CourseDto?> GetAsync(int id)
    {
        var http = await _apiClient.GetClientAsync();
        return await http.GetFromJsonAsync<CourseDto>($"/courses/{id}");
    }
}
