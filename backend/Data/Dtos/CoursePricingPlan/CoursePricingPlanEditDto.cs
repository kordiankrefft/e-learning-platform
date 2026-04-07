using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.CoursePricingPlan
{
    public class CoursePricingPlanEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

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
