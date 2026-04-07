using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.Lesson;

public class LessonDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("moduleId")]
    public int ModuleId { get; set; }

    [JsonPropertyName("moduleTitle")]
    public string ModuleTitle { get; set; } = "";

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "";

    [JsonPropertyName("orderIndex")]
    public int OrderIndex { get; set; }

    [JsonPropertyName("estimatedMinutes")]
    public int? EstimatedMinutes { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}
