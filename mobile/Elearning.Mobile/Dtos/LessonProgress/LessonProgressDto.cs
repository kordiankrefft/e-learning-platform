using System;
using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.LessonProgress;

public class LessonProgressDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("userId")]
    public int UserId { get; set; }

    [JsonPropertyName("userName")]
    public string UserName { get; set; } = "";

    [JsonPropertyName("lessonId")]
    public int LessonId { get; set; }

    [JsonPropertyName("lessonTitle")]
    public string LessonTitle { get; set; } = "";

    [JsonPropertyName("progressPercent")]
    public decimal ProgressPercent { get; set; }

    [JsonPropertyName("lastViewedAt")]
    public DateTime LastViewedAt { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}
