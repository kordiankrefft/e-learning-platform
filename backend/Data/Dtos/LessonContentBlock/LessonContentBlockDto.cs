using System.Text.Json.Serialization;

namespace Data.Dtos.LessonContentBlock
{
    public class LessonContentBlockDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("lessonId")]
        public int LessonId { get; set; }

        [JsonPropertyName("lessonTitle")]
        public string LessonTitle { get; set; } = null!;

        [JsonPropertyName("blockType")]
        public string BlockType { get; set; } = null!;

        [JsonPropertyName("content")]
        public string? Content { get; set; }

        [JsonPropertyName("orderIndex")]
        public int OrderIndex { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
