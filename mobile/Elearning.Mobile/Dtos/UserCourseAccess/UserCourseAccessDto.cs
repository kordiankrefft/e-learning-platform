using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.UserCourseAccess;

public class UserCourseAccessDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("courseId")]
    public int CourseId { get; set; }

    [JsonPropertyName("accessStart")]
    public string AccessStart { get; set; } = "";

    [JsonPropertyName("accessEnd")]
    public string? AccessEnd { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("isRevoked")]
    public bool IsRevoked { get; set; }
}
