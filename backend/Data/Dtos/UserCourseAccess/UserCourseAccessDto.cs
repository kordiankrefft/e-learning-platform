using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.UserCourseAccess
{
    public class UserCourseAccessDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("userName")]
        public string UserName { get; set; } = null!;

        [JsonPropertyName("courseId")]
        public int CourseId { get; set; }

        [JsonPropertyName("courseTitle")]
        public string? CourseTitle { get; set; }

        [JsonPropertyName("coursePricingPlanId")]
        public int? CoursePricingPlanId { get; set; }

        [JsonPropertyName("coursePricingPlanName")]
        public string? CoursePricingPlanName { get; set; }

        [JsonPropertyName("accessStart")]
        public DateTime AccessStart { get; set; }

        [JsonPropertyName("accessEnd")]
        public DateTime? AccessEnd { get; set; }

        [JsonPropertyName("isRevoked")]
        public bool IsRevoked { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
