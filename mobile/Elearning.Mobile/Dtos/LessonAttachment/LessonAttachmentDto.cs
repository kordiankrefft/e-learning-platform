using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.LessonAttachment;

public class LessonAttachmentDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("lessonId")]
    public int LessonId { get; set; }

    [JsonPropertyName("fileName")]
    public string FileName { get; set; } = "";

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("fileUrl")]
    public string FileUrl { get; set; } = "";

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}
