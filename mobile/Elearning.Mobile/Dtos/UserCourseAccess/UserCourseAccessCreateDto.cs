using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.UserCourseAccess;

public class UserCourseAccessCreateDto
{
    [JsonPropertyName("courseId")]
    public int CourseId { get; set; }

    [JsonPropertyName("coursePricingPlanId")]
    public int CoursePricingPlanId { get; set; }
}
