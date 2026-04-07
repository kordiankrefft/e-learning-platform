using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.UserCourseEnrollment;

public class UserCourseEnrollmentCreateDto
{
    [JsonPropertyName("courseId")]
    public int CourseId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Active";
}
