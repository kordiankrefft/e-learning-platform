using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.Course
{
    public class CourseDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("courseCategoryId")]
        public int? CourseCategoryId { get; set; }

        [JsonPropertyName("courseCategoryName")]
        public string CourseCategoryName { get; set; } = null!;

        [JsonPropertyName("title")]
        public string Title { get; set; } = null!;

        [JsonPropertyName("shortDescription")]
        public string? ShortDescription { get; set; }

        [JsonPropertyName("longDescription")]
        public string? LongDescription { get; set; }

        [JsonPropertyName("difficultyLevel")]
        public string? DifficultyLevel { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("thumbnailMediaId")]
        public int? ThumbnailMediaId { get; set; }

        [JsonPropertyName("thumbnailUrl")]
        public string? ThumbnailUrl { get; set; }

        [JsonPropertyName("thumbnailName")]
        public string ThumbnailName { get; set; } = null!;

        [JsonPropertyName("tutorUserId")]
        public int TutorUserId { get; set; }

        [JsonPropertyName("tutorUserName")]
        public string TutorUserName { get; set; } = null!;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime? UpdatedAt { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
