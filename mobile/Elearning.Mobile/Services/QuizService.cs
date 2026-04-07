using System.Net.Http.Json;
using Elearning.Mobile.Dtos.Quiz;

namespace Elearning.Mobile.Services;

public class QuizService
{
    private readonly ApiClient _apiClient;

    public QuizService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<QuizDto?> GetModuleQuizAsync(int moduleId)
    {
        var http = await _apiClient.GetClientAsync();
        return await http.GetFromJsonAsync<QuizDto>($"/modules/{moduleId}/quiz");
    }
}
