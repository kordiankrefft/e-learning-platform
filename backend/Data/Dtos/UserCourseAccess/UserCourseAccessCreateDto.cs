using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.UserCourseAccess
{
    public class UserCourseAccessCreateDto
    {
        [JsonPropertyName("courseId")]
        [Required]
        public int CourseId { get; set; }

        [JsonPropertyName("coursePricingPlanId")]
        public int? CoursePricingPlanId { get; set; }
    }
}
