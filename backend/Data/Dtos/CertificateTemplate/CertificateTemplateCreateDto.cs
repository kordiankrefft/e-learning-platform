using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.CertificateTemplate
{
    public class CertificateTemplateCreateDto
    {
        [JsonPropertyName("name")]
        [Required, StringLength(200)]
        public string? Name { get; set; }

        [JsonPropertyName("description")]
        [StringLength(500)]
        public string? Description { get; set; }

        [JsonPropertyName("templateBody")]
        [Required]
        public string TemplateBody { get; set; } = null!;
    }
}
