using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.Quiz;

public class QuizDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("lessonId")]
    public int? LessonId { get; set; }

    [JsonPropertyName("lessonTitle")]
    public string? LessonTitle { get; set; }

    [JsonPropertyName("moduleId")]
    public int? ModuleId { get; set; }

    [JsonPropertyName("moduleTitle")]
    public string? ModuleTitle { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("timeLimitSeconds")]
    public int? TimeLimitSeconds { get; set; }

    [JsonPropertyName("passThresholdPct")]
    public decimal? PassThresholdPct { get; set; }

    [JsonPropertyName("maxAttempts")]
    public int? MaxAttempts { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("studentPassed")]
    public bool? StudentPassed { get; set; }
}
