using System.Text.Json.Serialization;

namespace Data.Dtos.CoursePricingPlan
{
    public class CoursePricingPlanDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("courseId")]
        public int CourseId { get; set; }

        [JsonPropertyName("courseTitle")]
        public string CourseTitle { get; set; } = null!;

        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("accessDurationDays")]
        public int? AccessDurationDays { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
