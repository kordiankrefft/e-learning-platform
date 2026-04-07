using System.Text.Json.Serialization;

public class QuizTakeDto
{
    [JsonPropertyName("quizId")]
    public int QuizId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("passThresholdPct")]
    public decimal? PassThresholdPct { get; set; }

    [JsonPropertyName("maxAttempts")]
    public int? MaxAttempts { get; set; }

    [JsonPropertyName("timeLimitSeconds")]
    public int? TimeLimitSeconds { get; set; }

    [JsonPropertyName("questions")]
    public List<QuizTakeQuestionDto> Questions { get; set; } = new();
}