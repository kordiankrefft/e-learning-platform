using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.PageContentBlock
{
    public class PageContentBlockDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("pageKey")]
        public string PageKey { get; set; } = null!;

        [JsonPropertyName("blockType")]
        public string BlockType { get; set; } = null!;

        [JsonPropertyName("content")]
        public string? Content { get; set; }

        [JsonPropertyName("mediaFileId")]
        public int? MediaFileId { get; set; }

        [JsonPropertyName("mediaFileUrl")]
        public string? MediaFileUrl { get; set; }

        [JsonPropertyName("thumbnailName")]
        public string ThumbnailName { get; set; } = null!;

        [JsonPropertyName("orderIndex")]
        public int OrderIndex { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }

        [JsonPropertyName("updatedByUserId")]
        public int? UpdatedByUserId { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; }
    }
}
