using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.Quiz
{
    public class QuizCreateDto
    {
        [JsonPropertyName("lessonId")]
        public int? LessonId { get; set; }

        [JsonPropertyName("moduleId")]
        public int? ModuleId { get; set; }

        [JsonPropertyName("title")]
        [Required, StringLength(200)]
        public string? Title { get; set; }

        [JsonPropertyName("description")]
        [StringLength(1000)]
        public string? Description { get; set; }

        [JsonPropertyName("timeLimitSeconds")]
        public int? TimeLimitSeconds { get; set; }

        [JsonPropertyName("passThresholdPct")]
        public decimal? PassThresholdPct { get; set; }

        [JsonPropertyName("maxAttempts")]
        public int? MaxAttempts { get; set; }
    }
}
