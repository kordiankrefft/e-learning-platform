using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.LessonContentBlock
{
    public class LessonContentBlockEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("lessonId")]
        [Required]
        public int LessonId { get; set; }

        [JsonPropertyName("blockType")]
        [Required, StringLength(50)]
        public string? BlockType { get; set; }

        [JsonPropertyName("content")]
        public string? Content { get; set; }

        [JsonPropertyName("orderIndex")]
        [Required]
        public int OrderIndex { get; set; }
    }
}