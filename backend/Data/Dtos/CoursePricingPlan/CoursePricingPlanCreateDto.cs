using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.CoursePricingPlan
{
    public class CoursePricingPlanCreateDto
    {
        [JsonPropertyName("courseId")]
        [Required]
        public int CourseId { get; set; }

        [JsonPropertyName("name")]
        [Required, StringLength(100)]
        public string? Name { get; set; }

        [JsonPropertyName("description")]
        [StringLength(500)]
        public string? Description { get; set; }

        [JsonPropertyName("accessDurationDays")]
        public int? AccessDurationDays { get; set; }
    }
}
