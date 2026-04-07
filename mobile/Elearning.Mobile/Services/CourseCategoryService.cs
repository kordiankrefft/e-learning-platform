using System.Net.Http.Json;
using Elearning.Mobile.Dtos.CourseCategory;

namespace Elearning.Mobile.Services;

public class CourseCategoryService
{
    private readonly ApiClient _apiClient;

    public CourseCategoryService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<CourseCategoryDto>> GetAllAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<CourseCategoryDto>>("/course-categories");
        return data ?? [];
    }
}
