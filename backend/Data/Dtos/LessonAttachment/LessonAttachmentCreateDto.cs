using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.LessonAttachment
{
    public class LessonAttachmentCreateDto
    {
        [JsonPropertyName("lessonId")]
        [Required]
        public int LessonId { get; set; }

        [JsonPropertyName("fileName")]
        [Required, StringLength(255)]
        public string? FileName { get; set; }

        [JsonPropertyName("fileUrl")]
        [Required, StringLength(500)]
        public string? FileUrl { get; set; }

        [JsonPropertyName("description")]
        [StringLength(500)]
        public string? Description { get; set; }
    }
}
