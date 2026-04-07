using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.PageContentBlock
{
    public class PageContentBlockEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("pageKey")]
        [Required, StringLength(100)]
        public string? PageKey { get; set; }

        [JsonPropertyName("blockType")]
        [Required, StringLength(50)]
        public string? BlockType { get; set; }

        [JsonPropertyName("content")]
        public string? Content { get; set; }

        [JsonPropertyName("mediaFileId")]
        public int? MediaFileId { get; set; }

        [JsonPropertyName("orderIndex")]
        [Required]
        public int OrderIndex { get; set; }
    }
}
