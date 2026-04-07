using System.Text.Json.Serialization;

namespace Data.Dtos.LessonAttachment
{
    public class LessonAttachmentDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("lessonId")]
        public int LessonId { get; set; }

        [JsonPropertyName("lessonTitle")]
        public string LessonTitle { get; set; } = null!;

        [JsonPropertyName("fileName")]
        public string FileName { get; set; } = null!;

        [JsonPropertyName("fileUrl")]
        public string FileUrl { get; set; } = null!;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
