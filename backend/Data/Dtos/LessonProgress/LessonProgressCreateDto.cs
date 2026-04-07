using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.LessonProgress
{
    public class LessonProgressCreateDto
    {
        [JsonPropertyName("lessonId")]
        [Required]
        public int LessonId { get; set; }

        [JsonPropertyName("progressPercent")]
        [Range(0, 100)]
        public decimal ProgressPercent { get; set; }
    }
}
