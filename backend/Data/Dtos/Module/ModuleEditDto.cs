using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.Module
{
    public class ModuleEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("courseId")]
        [Required]
        public int CourseId { get; set; }

        [JsonPropertyName("title")]
        [Required, StringLength(200)]
        public string? Title { get; set; }

        [JsonPropertyName("description")]
        [StringLength(1000)]
        public string? Description { get; set; }

        [JsonPropertyName("orderIndex")]
        [Required]
        public int OrderIndex { get; set; }
    }
}
