using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.CoursePricingPlan;

public class CoursePricingPlanDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("courseId")]
    public int CourseId { get; set; }

    [JsonPropertyName("courseTitle")]
    public string CourseTitle { get; set; } = "";

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("accessDurationDays")]
    public int? AccessDurationDays { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    public string DurationText => AccessDurationDays.HasValue
        ? $"{AccessDurationDays.Value} dni"
        : "bez limitu";

    public string DescriptionText => string.IsNullOrWhiteSpace(Description)
        ? "Brak opisu planu"
        : Description!;
}
