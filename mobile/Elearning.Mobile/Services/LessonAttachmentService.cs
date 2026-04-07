using System.Net.Http.Json;
using Elearning.Mobile.Dtos.LessonAttachment;

namespace Elearning.Mobile.Services;

public class LessonAttachmentService
{
    private readonly ApiClient _apiClient;
    public LessonAttachmentService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }
    public async Task<List<LessonAttachmentDto>> GetForLessonAsync(int lessonId)
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<LessonAttachmentDto>>($"/lessons/{lessonId}/attachments");
        return data ?? [];
    }
}
