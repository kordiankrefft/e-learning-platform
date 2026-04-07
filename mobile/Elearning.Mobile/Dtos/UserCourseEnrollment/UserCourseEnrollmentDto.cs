using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.UserCourseEnrollment;

public class UserCourseEnrollmentDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("courseId")]
    public int CourseId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "";

    [JsonPropertyName("completedAt")]
    public string? CompletedAt { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}
