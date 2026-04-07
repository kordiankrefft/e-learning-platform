using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.PageContentBlock;

public class PageContentBlockDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("pageKey")]
    public string PageKey { get; set; } = "";

    [JsonPropertyName("blockType")]
    public string BlockType { get; set; } = "";

    [JsonPropertyName("content")]
    public string? Content { get; set; }

    [JsonPropertyName("orderIndex")]
    public int OrderIndex { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("mediaFileId")]
    public int? MediaFileId { get; set; }

    [JsonPropertyName("mediaFileUrl")]
    public string? MediaFileUrl { get; set; }
}
