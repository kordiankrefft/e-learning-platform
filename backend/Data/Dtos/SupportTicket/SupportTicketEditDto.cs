using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.SupportTicket
{
    public class SupportTicketEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("courseId")]
        public int? CourseId { get; set; }

        [JsonPropertyName("assignedTutorId")]
        public int? AssignedTutorId { get; set; }

        [JsonPropertyName("title")]
        [Required, StringLength(200)]
        public string? Title { get; set; }

        [JsonPropertyName("status")]
        [Required, StringLength(50)]
        public string? Status { get; set; }
    }
}
