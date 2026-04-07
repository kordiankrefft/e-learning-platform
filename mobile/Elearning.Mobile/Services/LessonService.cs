using System.Net.Http.Json;
using Elearning.Mobile.Dtos.Lesson;

namespace Elearning.Mobile.Services;

public class LessonService
{
    private readonly ApiClient _apiClient;

    public LessonService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<LessonDto>> GetModuleLessonsAsync(int moduleId)
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<LessonDto>>($"/modules/{moduleId}/lessons");
        return data ?? [];
    }

    public async Task<LessonDto?> GetAsync(int id)
    {
        var http = await _apiClient.GetClientAsync();
        return await http.GetFromJsonAsync<LessonDto>($"/lessons/{id}");
    }
}
