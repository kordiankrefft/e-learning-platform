using System.Net.Http.Json;
using Elearning.Mobile.Dtos.LessonContentBlock;

namespace Elearning.Mobile.Services;

public class LessonContentBlockService
{
    private readonly ApiClient _apiClient;
    public LessonContentBlockService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<LessonContentBlockDto>> GetForLessonAsync(int lessonId)
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<LessonContentBlockDto>>($"/lessons/{lessonId}/content-blocks");
        return data ?? [];
    }
}
