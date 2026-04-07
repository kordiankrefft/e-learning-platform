using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.Course
{
    public class CourseCreateDto
    {
        [JsonPropertyName("courseCategoryId")]
        public int? CourseCategoryId { get; set; }

        [JsonPropertyName("title")]
        [Required, StringLength(200)]
        public string? Title { get; set; }

        [JsonPropertyName("shortDescription")]
        [StringLength(500)]
        public string? ShortDescription { get; set; }

        [JsonPropertyName("longDescription")]
        public string? LongDescription { get; set; }

        [JsonPropertyName("difficultyLevel")]
        [StringLength(50)]
        public string? DifficultyLevel { get; set; }

        [JsonPropertyName("status")]
        [Required, StringLength(50)]
        public string? Status { get; set; }

        [JsonPropertyName("thumbnailMediaId")]
        public int? ThumbnailMediaId { get; set; }

        [JsonPropertyName("tutorUserId")]
        public int? TutorUserId { get; set; }
    }
}
