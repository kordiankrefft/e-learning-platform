using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.Course;

public class CourseDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("courseCategoryId")]
    public int? CourseCategoryId { get; set; }

    [JsonPropertyName("courseCategoryName")]
    public string CourseCategoryName { get; set; } = "";

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("shortDescription")]
    public string? ShortDescription { get; set; }

    [JsonPropertyName("longDescription")]
    public string? LongDescription { get; set; }

    [JsonPropertyName("difficultyLevel")]
    public string? DifficultyLevel { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "";

    [JsonPropertyName("thumbnailUrl")]
    public string? ThumbnailUrl { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}
