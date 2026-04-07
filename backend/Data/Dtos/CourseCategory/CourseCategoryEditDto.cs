using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.CourseCategory
{
    public class CourseCategoryEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        [Required, StringLength(200)]
        public string? Name { get; set; }

        [JsonPropertyName("description")]
        [StringLength(1000)]
        public string? Description { get; set; }
    }
}
