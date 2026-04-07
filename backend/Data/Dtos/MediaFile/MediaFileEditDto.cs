using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.MediaFile
{
    public class MediaFileEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("fileUrl")]
        [Required, StringLength(500)]
        public string? FileUrl { get; set; }

        [JsonPropertyName("fileName")]
        [Required, StringLength(255)]
        public string? FileName { get; set; }

        [JsonPropertyName("mimeType")]
        [StringLength(100)]
        public string? MimeType { get; set; }

        [JsonPropertyName("width")]
        public int? Width { get; set; }

        [JsonPropertyName("height")]
        public int? Height { get; set; }
    }
}
