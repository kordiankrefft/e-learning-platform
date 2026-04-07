using System.Net.Http.Json;
using Elearning.Mobile.Dtos.LessonProgress;

namespace Elearning.Mobile.Services;

public class LessonProgressService
{
    private readonly ApiClient _apiClient;

    public LessonProgressService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<LessonProgressDto>> GetAllAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<LessonProgressDto>>("/lesson-progress");
        return data ?? [];
    }

    public async Task<LessonProgressDto?> GetAsync(int id)
    {
        var http = await _apiClient.GetClientAsync();
        return await http.GetFromJsonAsync<LessonProgressDto>($"/lesson-progress/{id}");
    }

    public async Task CreateOrUpdateAsync(LessonProgressDto dto)
    {
        var http = await _apiClient.GetClientAsync();
        var resp = await http.PostAsJsonAsync("/lesson-progress", dto);
        resp.EnsureSuccessStatusCode();
    }
}
