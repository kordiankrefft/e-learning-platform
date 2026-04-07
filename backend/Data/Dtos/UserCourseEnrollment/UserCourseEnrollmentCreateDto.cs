using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.UserCourseEnrollment
{
    public class UserCourseEnrollmentCreateDto
    {
        [JsonPropertyName("courseId")]
        [Required]
        public int CourseId { get; set; }

        [JsonPropertyName("status")]
        [Required, StringLength(50)]
        public string? Status { get; set; }
    }
}