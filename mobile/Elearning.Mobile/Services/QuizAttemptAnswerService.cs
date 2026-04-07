using System.Net.Http.Json;
using Elearning.Mobile.Dtos.QuizAttemptAnswer;

namespace Elearning.Mobile.Services;

public class QuizAttemptAnswerService
{
    private readonly ApiClient _apiClient;
    public QuizAttemptAnswerService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task CreateForAttemptAsync(int attemptId, QuizAttemptAnswerCreateDto dto)
    {
        var http = await _apiClient.GetClientAsync();
        var res = await http.PostAsJsonAsync($"/quiz-attempts/{attemptId}/answers", dto);
        res.EnsureSuccessStatusCode();
    }
}