using System.Net.Http.Json;
using Elearning.Mobile.Dtos.QuizTake;

namespace Elearning.Mobile.Services;

public class QuizTakeService
{
    private readonly ApiClient _apiClient;
    public QuizTakeService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<QuizTakeDto?> GetQuizTakeAsync(int quizId)
    {
        var http = await _apiClient.GetClientAsync();
        return await http.GetFromJsonAsync<QuizTakeDto>($"/quizzes/{quizId}/take");
    }
}
