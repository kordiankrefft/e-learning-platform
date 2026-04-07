using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.Lesson
{
    public class LessonEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("moduleId")]
        [Required]
        public int ModuleId { get; set; }

        [JsonPropertyName("title")]
        [Required, StringLength(200)]
        public string? Title { get; set; }

        [JsonPropertyName("summary")]
        [StringLength(1000)]
        public string? Summary { get; set; }

        [JsonPropertyName("status")]
        [Required, StringLength(50)]
        public string? Status { get; set; }

        [JsonPropertyName("orderIndex")]
        [Required]
        public int OrderIndex { get; set; }

        [JsonPropertyName("estimatedMinutes")]
        public int? EstimatedMinutes { get; set; }
    }
}
    