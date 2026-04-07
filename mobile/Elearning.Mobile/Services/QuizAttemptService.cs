using System.Net.Http.Json;
using System.Text.Json;
using Elearning.Mobile.Dtos.QuizAttempt;

namespace Elearning.Mobile.Services;

public class QuizAttemptService
{
    private readonly ApiClient _apiClient;

    public QuizAttemptService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<int> CreateAsync(int quizId)
    {
        var http = await _apiClient.GetClientAsync();
        var res = await http.PostAsJsonAsync("/quiz-attempts", new QuizAttemptCreateDto
        {
            QuizId = quizId
        });

        if (!res.IsSuccessStatusCode)
        {
            var msg = (await res.Content.ReadAsStringAsync())?.Trim();

            if (!string.IsNullOrWhiteSpace(msg) && msg.StartsWith("\"") && msg.EndsWith("\""))
                msg = JsonSerializer.Deserialize<string>(msg);

            throw new Exception(string.IsNullOrWhiteSpace(msg)
                ? $"Błąd HTTP {(int)res.StatusCode}"
                : msg);
        }

        var body = await res.Content.ReadFromJsonAsync<QuizAttemptCreateResponseDto>();
        return body?.AttemptId ?? 0;
    }

    public async Task<QuizAttemptDto?> SubmitAsync(int attemptId)
    {
        var http = await _apiClient.GetClientAsync();
        var dto = new QuizAttemptEditDto
        {
            Id = attemptId,
            SubmittedAt = DateTime.UtcNow.ToString("o")
        };

        var res = await http.PutAsJsonAsync($"/quiz-attempts/{attemptId}", dto);

        if (!res.IsSuccessStatusCode)
        {
            var msg = (await res.Content.ReadAsStringAsync())?.Trim();
            if (!string.IsNullOrWhiteSpace(msg) && msg.StartsWith("\"") && msg.EndsWith("\""))
                msg = JsonSerializer.Deserialize<string>(msg);

            throw new Exception(string.IsNullOrWhiteSpace(msg)
                ? $"Błąd HTTP {(int)res.StatusCode}"
                : msg);
        }

        return await res.Content.ReadFromJsonAsync<QuizAttemptDto>();
    }
}
